-- Run only against a disposable database with 09_commercial.sql installed.
-- Every fixture is rolled back. psql -v ON_ERROR_STOP=1 -f scripts/commercial-db.test.sql
begin;
insert into auth.users(id) values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222') on conflict do nothing;
insert into com_admins(user_id) values('11111111-1111-4111-8111-111111111111') on conflict do nothing;
update com_settings set enabled=true,auto_quote=true;
create or replace function pg_temp.fixture(p_test boolean default true) returns uuid language plpgsql as $$
declare id uuid:=gen_random_uuid();
begin
 perform com_create_quote(id,gen_random_uuid(),jsonb_build_object('name','QA','email',id||'@example.test','zone','Palermo','m2',150,'timing','Esta semana','message','QA','snapshot',jsonb_build_object('pack','Destacado','services',jsonb_build_array('Fotografía HDR','Tour','Planos'),'videos',jsonb_build_array('Cinematográfico'),'addons','[]'::jsonb,'total',335000)),id::text,p_test);
 return id;
end $$;
do $$
declare a uuid;b uuid;c uuid;d uuid;e uuid; r jsonb;r2 jsonb; s date:=date_trunc('week',now())::date+7; count_before integer; first_expiry timestamptz; j jsonb;
begin
 a:=pg_temp.fixture();b:=pg_temp.fixture();
 insert into com_weeks(week_start,capacity) values(s,1);
 r:=com_hold(a,s);first_expiry:=(r->>'hold_until')::timestamptz;
 r2:=com_hold(a,s);
 assert r->>'id'=r2->>'id','Duplicate reservation created';
 assert (r2->>'hold_until')::timestamptz=first_expiry,'Retry extended deadline';
 begin perform com_hold(b,s);raise exception 'TEST: overbooking allowed';exception when others then if SQLERRM='TEST: overbooking allowed' then raise; end if;assert SQLERRM like 'FLOW:%','Unexpected booking error';end;
 assert (select count(*) from com_jobs where quote_id=a and template_key='quote' and status='pending')=1,'Hold cancelled formal quote';
 perform com_apply_payment(jsonb_build_object('id','test-payment-1','reservation_id',r->>'id','amount',15000,'currency','ARS','is_test',true,'status','approved','approved_at',now()));
 perform com_apply_payment(jsonb_build_object('id','test-payment-1','reservation_id',r->>'id','amount',15000,'currency','ARS','is_test',true,'status','approved','approved_at',now()));
 assert (select count(*) from com_payments where id='test-payment-1')=1,'Duplicate payment inserted';
 assert (select count(*) from com_jobs where quote_id=a and template_key='confirmed')=1,'Duplicate confirmation queued';
 assert (select count(*) from com_jobs where quote_id=a and template_key='reminder' and status='pending')=0,'Paid reminders still pending';
 assert (select produccion_id from com_quotes where id=a) is null,'Test payment created real production';
 perform com_apply_payment(jsonb_build_object('id','test-payment-extra','reservation_id',r->>'id','amount',15000,'currency','ARS','is_test',true,'status','approved','approved_at',now()));
 assert (select status from com_reservations where id=(r->>'id')::uuid)='confirmed','Duplicate payment lost confirmed slot';
 assert (select review from com_payments where id='test-payment-extra'),'Duplicate payment not flagged';
 c:=pg_temp.fixture();
 insert into com_weeks(week_start,capacity) values(s+7,1);
 r:=com_hold(c,s+7);
 update com_reservations set hold_until=now()-interval '1 hour' where id=(r->>'id')::uuid;
 perform com_expire(true);
 assert (select status from com_reservations where id=(r->>'id')::uuid)='expired','Hold did not expire';
 r2:=com_hold(b,s+7);
 perform com_apply_payment(jsonb_build_object('id','test-late','reservation_id',r->>'id','amount',15000,'currency','ARS','is_test',true,'status','approved','approved_at',now()));
 assert (select status from com_reservations where id=(r->>'id')::uuid)='payment_review','Late payment confirmed occupied week';
 assert (select paused from com_quotes where id=c),'Late payment did not pause reminders';
 d:=pg_temp.fixture(false);
 insert into com_weeks(week_start,capacity) values(s+14,2);
 r:=com_hold(d,s+14);
 select count(*) into count_before from fin_movimientos;
 perform com_apply_payment(jsonb_build_object('id','production-payment','reservation_id',r->>'id','amount',15000,'currency','ARS','is_test',false,'status','approved','approved_at',now()));
 perform com_apply_payment(jsonb_build_object('id','production-payment','reservation_id',r->>'id','amount',15000,'currency','ARS','is_test',false,'status','approved','approved_at',now()));
 assert (select count(*) from fin_movimientos)=count_before+1,'Finance payment duplicate';
 assert (select produccion_id from com_quotes where id=d) is not null,'Missing linked production';
 assert (select cliente_id from com_quotes where id=d) is not null,'Missing customer';
 assert (select count(*) from fin_movimientos where cobro_id=(select finance_id from com_quotes where id=d))=1,'Deposit not linked to full bill';
 begin perform com_admin_action('week',null,jsonb_build_object('week_start',s+14,'capacity',0,'enabled',true),'11111111-1111-4111-8111-111111111111');raise exception 'TEST: capacity reduced below paid reservations';exception when others then if SQLERRM like 'TEST:%' then raise;end if;assert SQLERRM like 'FLOW:%';end;
 begin perform com_apply_payment(jsonb_build_object('id','bad-amount','reservation_id',r->>'id','amount',1,'currency','ARS','is_test',false,'status','approved','approved_at',now()));raise exception 'TEST: wrong amount accepted';exception when others then if SQLERRM like 'TEST:%' then raise;end if;assert SQLERRM like 'FLOW:%';end;
 -- Drafts stay separate until explicitly published.
 perform com_admin_action('template_draft',null,'{"key":"quote","subject":"Draft","body":"Draft body"}','11111111-1111-4111-8111-111111111111');
 assert (select subject from com_templates where key='quote')<>'Draft','Draft was published accidentally';
 perform com_admin_action('template_publish',null,'{"key":"quote","enabled":true}','11111111-1111-4111-8111-111111111111');
 assert (select subject from com_templates where key='quote')='Draft';
 -- Only one processing job per quote; retries cannot claim the same row.
 update com_jobs set status='cancelled';
 perform com_queue(a,'quote',now(),'test-claim-a');perform com_queue(a,'confirmed',now(),'test-claim-b');
 j:=com_claim_job(true);assert j is not null;
 assert com_claim_job(true) is null,'Concurrent jobs can target one customer';
 raise notice 'PASS: holds, capacity, expiration, payment idempotency, late/duplicate payments, finance, templates, job claims';
end $$;
-- Public and ordinary authenticated users cannot read sensitive commercial data or call transitions.
do $$ begin
 assert not has_table_privilege('anon','com_quotes','SELECT');
 assert not has_function_privilege('authenticated','public.com_hold(uuid,date)','EXECUTE');
 assert not has_table_privilege('authenticated','com_quotes','UPDATE');
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin assert (select count(*) from com_quotes)=0,'Non-admin can read customers'; end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin assert (select count(*) from com_quotes)>0,'Admin cannot read inquiries';end $$;
reset role;
rollback;

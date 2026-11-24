import {renderToString} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import ContentGuidePage from './pages/ContentGuidePage';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import PhotographyPage from './pages/PhotographyPage';
import VideoPage from './pages/VideoPage';
import PlansPage from './pages/PlansPage';
import ToursPage from './pages/ToursPage';
import AerialPage from './pages/AerialPage';
const pages={'/':HomePage,'/portfolio':PortfolioPage,'/fotografia-inmobiliaria':PhotographyPage,'/video-inmobiliario':VideoPage,'/planos-2d':PlansPage,'/tour-virtual-360':ToursPage,'/drone-inmobiliario':AerialPage};
export function render(path){if(['/fpv-inmobiliario','/contenido-inmobiliario'].includes(path))return renderToString(<StaticRouter location={path}><ContentGuidePage slug={path.slice(1)}/></StaticRouter>);const Page=pages[path];if(!Page)throw new Error(`Missing public page: ${path}`);return renderToString(<StaticRouter location={path}><Page/></StaticRouter>);}

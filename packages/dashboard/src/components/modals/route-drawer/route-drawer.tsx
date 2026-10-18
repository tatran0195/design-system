import { createRouteModal, type RouteDrawerComponent } from '../route-modal-root';
/** Controlled by default; route navigation is opt-in through `prev`. */
export const RouteDrawer: RouteDrawerComponent = createRouteModal('drawer');
export const DashboardDrawer: RouteDrawerComponent = RouteDrawer;

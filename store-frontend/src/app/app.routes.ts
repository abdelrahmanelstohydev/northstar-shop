import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

import { PublicLayoutComponent } from './public/public-layout.component';
import { HomeComponent } from './public/home.component';
import { ItemDetailsComponent } from './public/item-details.component';
import { FavoritesComponent } from './public/favorites.component';
import { CartComponent } from './public/cart.component';
import { CheckoutComponent } from './public/checkout.component';

import { LoginComponent } from './admin/login.component';
import { AdminLayoutComponent } from './admin/admin-layout.component';
import { DashboardComponent } from './admin/dashboard.component';
import { AdminCategoriesComponent } from './admin/admin-categories.component';
import { AdminItemsComponent } from './admin/admin-items.component';
import { ItemFormComponent } from './admin/item-form.component';
import { AdminOrdersComponent } from './admin/admin-orders.component';
import { OrderDetailsComponent } from './admin/order-details.component';

export const routes: Routes = [
  { path: 'admin/login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'items', component: AdminItemsComponent },
      { path: 'items/new', component: ItemFormComponent },
      { path: 'items/:id/edit', component: ItemFormComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'orders/:id', component: OrderDetailsComponent },
    ],
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'items/:id', component: ItemDetailsComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];

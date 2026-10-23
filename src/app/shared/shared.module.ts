import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FooterComponent } from './Footer/footer.component';
import { HeaderComponent } from './Header/header.component';
import { SideNavigationComponent } from './side-navigation/side-navigation.component';

@NgModule({
  declarations: [  
    HeaderComponent,
    FooterComponent,
    SideNavigationComponent
  ],
  imports: [
    CommonModule,

  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SideNavigationComponent
  ]
})
export class SharedModule {}

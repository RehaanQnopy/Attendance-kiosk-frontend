import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FooterComponent } from './Components/Footer/footer.component';
import { HeaderComponent } from './Components/Header/header.component';


@NgModule({
  declarations: [  
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,

  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})
export class SharedModule {}

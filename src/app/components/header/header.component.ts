// src/app/components/header/header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() userName: string = '';
  @Output() logoutEvent = new EventEmitter<void>();

  logout(): void {
    this.logoutEvent.emit();
  }
}
import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AppointmentOut } from '@app/api/models';

@Component({
  imports: [MatIconModule, MatListModule],
  selector: 'app-card-options',
  styleUrl: './card-options.css',
  templateUrl: './card-options.html',
})
export class CardOptions {
  private readonly sheetRef = inject(MatBottomSheetRef<CardOptions>);
  readonly appointment = inject<AppointmentOut>(MAT_BOTTOM_SHEET_DATA);

  get mapsHref(): string {
    const address = this.appointment.address ?? '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  get telHref(): string {
    return `tel:${this.appointment.phone}`;
  }

  dismiss(): void {
    this.sheetRef.dismiss();
  }
}

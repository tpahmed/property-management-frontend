import { Injectable } from '@angular/core';
import { Property } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyUtilsService {
  constructor() {}

  getImageUrl(property: Property): string {
    if (property.images && property.images.length > 0) {
      const image = property.images[0];
      if (typeof image === 'string') {
        return `url(${image})`;
      } else if (typeof image === 'object' && 'url' in image) {
        return `url(${image.url})`;
      }
    }
    return 'url(/assets/images/property-placeholder.jpg)';
  }

  getAddress(property: Property): string {
    if (typeof property.address === 'string') {
      return `${property.address}, ${property.city}, ${property.state}`;
    } else if (typeof property.address === 'object') {
      return `${property.address.street}, ${property.address.city}, ${property.address.state}`;
    }
    return '';
  }

  getArea(property: Property): number {
    return property.area || property.squareFeet || 0;
  }

  getAvailableDate(property: Property): string {
    return property.availableFrom || property.availableDate || '';
  }
}

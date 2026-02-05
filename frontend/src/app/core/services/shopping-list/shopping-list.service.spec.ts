import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {ShoppingListService} from './shopping-list.service';
import {ApiEndpoints} from '@core/constants/api-endpoints';
import {createMockShoppingList} from '@testing/test-data.util';
import type {UpdateShoppingListItemPayload} from '@core/models/payloads/update-shopping-list-item.payload';

describe('ShoppingListService', () => {
  let service: ShoppingListService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShoppingListService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShoppingListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('getShoppingList', () => {
    it('getShoppingList_whenSuccess_shouldReturnList', () => {
      const mockList = createMockShoppingList();

      service.getShoppingList(1).subscribe((list) => {
        expect(list).toEqual(mockList);
      });

      const req = httpMock.expectOne(ApiEndpoints.ShoppingList.Get(1));
      expect(req.request.method).toBe('GET');
      req.flush({data: mockList});
    });

    it('getShoppingList_whenDataNull_shouldThrowError', () => {
      service.getShoppingList(1).subscribe({
        error: (err: unknown) => {
          expect((err as Error).message).toContain('Failed to get shopping list');
        },
      });

      const req = httpMock.expectOne(ApiEndpoints.ShoppingList.Get(1));
      req.flush({data: null});
    });
  });

  describe('updateItemStatus', () => {
    it('updateItemStatus_whenCalled_shouldPutPayload', () => {
      const payload = {ingredientId: 1, checked: true} as unknown as UpdateShoppingListItemPayload;

      service.updateItemStatus(1, payload).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(ApiEndpoints.ShoppingList.UpdateItem(1));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('downloadPdf', () => {
    it('downloadPdf_whenCalled_shouldGetBlob', () => {
      const mockBlob = new Blob(['PDF'], {type: 'application/pdf'});

      service.downloadPdf(1).subscribe((blob) => {
        expect(blob).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne(ApiEndpoints.ShoppingList.Download(1));
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });
});

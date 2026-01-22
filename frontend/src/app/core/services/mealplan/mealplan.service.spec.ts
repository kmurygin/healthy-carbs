import {TestBed} from '@angular/core/testing';
import {MealPlanService} from './mealplan.service';
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient} from "@angular/common/http";
import {ApiEndpoints} from "../../constants/api-endpoints";
import type {MealPlanDto} from "../../models/dto/mealplan.dto";
import type {CreateMealPlanRequest} from "@features/dietitian/meal-plan-creator/meal-plan-creator.util";
import {MealPlanSource} from "../../models/enum/mealplan-source.enum";
import {REGULAR_TEST_USER} from "@testing/test-data.util";

describe('MealPlanService', () => {
  let service: MealPlanService;
  let httpMock: HttpTestingController;

  const mockMealPlan: MealPlanDto = {
    id: 1,
    user: REGULAR_TEST_USER,
    createdAt: '2026-01-01',
    days: [],
    totalCalories: 2000,
    totalCarbs: 200,
    totalFat: 70,
    totalProtein: 150,
    source: MealPlanSource.GENERATED
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MealPlanService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(MealPlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('service_whenInjected_shouldBeTruthy', () => {
    expect(service).toBeTruthy();
  });

  describe('generate', () => {
    it('generate_whenSuccess_shouldPostAndReturnPlan', () => {
      service.generate().subscribe(plan => {
        expect(plan).toEqual(mockMealPlan);
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush({data: mockMealPlan});
    });

    it('generate_whenResponseDataMissing_shouldThrowError', () => {
      service.generate().subscribe({
        next: () => {
          fail('expected error');
        },
        error: (err: unknown) => {
          expect(err instanceof Error
            ? err.message
            : String(err))
            .toContain('Failed to generate meal plan');
        }
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base);
      req.flush({data: null});
    });

    it('generate_whenResponseDataUndefined_shouldThrowError', () => {
      service.generate().subscribe({
        next: () => {
          fail('expected error');
        },
        error: (err: unknown) => {
          expect(err instanceof Error
            ? err.message
            : String(err))
            .toContain('Failed to generate meal plan');
        }
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base);
      req.flush({data: undefined});
    });
  });

  describe('getHistory', () => {
    it('getHistory_whenSuccess_shouldGetAndReturnArray', () => {
      const mockHistory = [mockMealPlan];
      service.getHistory().subscribe(history => {
        expect(history).toEqual(mockHistory);
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base + '/history');
      expect(req.request.method).toBe('GET');
      req.flush({data: mockHistory});
    });

    it('getHistory_whenDataNull_shouldReturnEmptyArray', () => {
      service.getHistory().subscribe(history => {
        expect(history).toEqual([]);
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base + '/history');
      req.flush({data: null});
    });

    it('getHistory_whenDataUndefined_shouldReturnEmptyArray', () => {
      service.getHistory().subscribe(history => {
        expect(history).toEqual([]);
      });

      const req = httpMock.expectOne(ApiEndpoints.MealPlan.Base + '/history');
      req.flush({data: undefined});
    });
  });

  describe('downloadPdf', () => {
    it('downloadPdf_whenCalled_shouldGetBlob', () => {
      const mockBlob = new Blob(['PDF content'], {type: 'application/pdf'});
      service.downloadPdf(123).subscribe(blob => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/123/download`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('getById', () => {
    it('getById_whenFound_shouldGetAndReturnPlan', () => {
      service.getById(1).subscribe(plan => {
        expect(plan).toEqual(mockMealPlan);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/1`);
      expect(req.request.method).toBe('GET');
      req.flush({data: mockMealPlan});
    });

    it('getById_whenDataNull_shouldThrowError', () => {
      service.getById(99).subscribe({
        next: () => {
          fail('expected error');
        },
        error: (err: unknown) => {
          expect(err instanceof Error
            ? err.message
            : String(err))
            .toContain('Meal plan with id 99 not found');
        }
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/99`);
      req.flush({data: null});
    });

    it('getById_whenDataUndefined_shouldThrowError', () => {
      service.getById(77).subscribe({
        next: () => {
          fail('expected error');
        },
        error: (err: unknown) => {
          expect(err instanceof Error
            ? err.message
            : String(err))
            .toContain('Meal plan with id 77 not found');
        }
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/77`);
      req.flush({data: undefined});
    });
  });

  describe('createManual', () => {
    const createManualRequest: CreateMealPlanRequest = {clientId: 1, startDate: '2026-01-01', days: []};
    const expectCreateManualError = (): void => {
      service.createManual(createManualRequest).subscribe({
        next: () => {
          fail('should have failed');
        },
        error: (err: unknown) => {
          expect(err instanceof Error
            ? err.message
            : String(err))
            .toBe('Failed to create meal plan');
        }
      });
    };

    it('createManual_whenSuccess_shouldPostAndReturnPlan', () => {
      service.createManual(createManualRequest).subscribe(plan => {
        expect(plan).toEqual(mockMealPlan);
      });

      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/manual`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createManualRequest);
      req.flush({data: mockMealPlan});
    });

    it('createManual_whenDataNull_shouldThrowError', () => {
      expectCreateManualError();
      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/manual`);
      req.flush({data: null});
    });

    it('createManual_whenDataUndefined_shouldThrowError', () => {
      expectCreateManualError();
      const req = httpMock.expectOne(`${ApiEndpoints.MealPlan.Base}/manual`);
      req.flush({data: undefined});
    });
  });
});

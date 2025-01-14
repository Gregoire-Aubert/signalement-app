import { Component, OnInit } from '@angular/core';
import { Company, CompanySearchResult } from '../../../model/Company';
import { CompanyService, MaxCompanyResult } from '../../../services/company.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddressService } from '../../../services/address.service';
import { CompleterItem, RemoteData } from 'ng2-completer';
import {
  AnalyticsService,
  CompanyEventActions,
  CompanySearchEventNames,
  EventCategories,
  ReportEventActions,
} from '../../../services/analytics.service';
import { Report, Step } from '../../../model/Report';
import { ReportRouterService } from '../../../services/report-router.service';
import { ReportStorageService } from '../../../services/report-storage.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

  step: Step;
  report: Report;

  around: boolean;

  searchForm: FormGroup;
  searchCtrl: FormControl;
  searchPostalCodeCtrl: FormControl;

  companyForm: FormGroup;
  nameCtrl: FormControl;
  addressCtrl: FormControl;
  addressCtrlPostalCode: string;

  companies: Company[];
  loading: boolean;
  searchWarning: string;
  searchError: string;

  showErrors: boolean;

  addressData: RemoteData;

  constructor(public formBuilder: FormBuilder,
              private reportStorageService: ReportStorageService,
              private reportRouterService: ReportRouterService,
              private companyService: CompanyService,
              private addressService: AddressService,
              private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.step = Step.Company;
    this.reportStorageService.reportInProgess.subscribe(report => {
      if (report) {
        this.report = report;
        this.initSearchForm();
      } else {
        this.reportRouterService.routeToFirstStep();
      }
    });
  }

  initSearchForm() {
    this.around = false;
    this.searchCtrl = this.formBuilder.control('', Validators.required);
    this.searchPostalCodeCtrl = this.formBuilder.control('', Validators.compose([Validators.required, Validators.pattern('[0-9]{5}')]));
    this.searchForm = this.formBuilder.group({
      search: this.searchCtrl,
      searchPostalCode: this.searchPostalCodeCtrl
    });
  }

  editCompany() {
    this.showErrors = false;
    this.nameCtrl = this.formBuilder.control('', Validators.required);
    this.addressCtrl = this.formBuilder.control('', Validators.required);
    this.addressCtrlPostalCode = '';
    this.companyForm = this.formBuilder.group({
      name: this.nameCtrl,
      address: this.addressCtrl,
    });
    this.addressData = this.addressService.addressData;
  }

  initSearch() {
    this.companyForm = null;
    this.companies = [];
    this.searchWarning = '';
    this.searchError = '';
  }

  isAround() {
    this.around = true;
    this.showErrors = false;
    this.initSearch();

  }

  isNotAround() {
    this.around = false;
    this.showErrors = false;
    this.initSearch();
  }

  searchCompany() {
    if (this.around) {
      this.showErrors = false;
      this.initSearch();
      this.loading = true;
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          this.analyticsService.trackEvent(EventCategories.company, CompanyEventActions.search, CompanySearchEventNames.around);
          this.companyService.getNearbyCompanies(lat, long).subscribe(
            companySearchResult => {
              this.loading = false;
              if (companySearchResult.total === 0) {
                this.treatCaseNoResult();
              } else if (companySearchResult.total === 1) {
                this.treatCaseSingleResult(companySearchResult);
              } else {
                this.treatCaseSeveralResults(companySearchResult);
              }
            },
            error => {
              this.loading = false;
              this.treatCaseError();
            }
          );
        }, (error) => {
           this.loading = false;
           this.showErrors = true;
        }, options);
      } else {
        this.loading = false;
        this.showErrors = true;
      }
    } else {
      if (!this.searchForm.valid) {
        this.showErrors = true;
      } else {
        this.initSearch();
        this.loading = true;
        this.analyticsService.trackEvent(
          EventCategories.company,
          CompanyEventActions.search,
          this.searchCtrl.value + ' ' + this.searchPostalCodeCtrl.value);
        this.companyService.searchCompanies(this.searchCtrl.value, this.searchPostalCodeCtrl.value).subscribe(
          companySearchResult => {
            this.loading = false;
            if (companySearchResult.total === 0) {
              this.treatCaseNoResult();
            } else if (companySearchResult.total === 1) {
              this.treatCaseSingleResult(companySearchResult);
            } else if (companySearchResult.total > MaxCompanyResult) {
              this.treatCaseTooManyResults();
            } else {
              this.treatCaseSeveralResults(companySearchResult);
            }
          },
          error => {
            this.loading = false;
            this.treatCaseError();
          }
        );
       }
    }
  }

  treatCaseNoResult() {
    this.analyticsService.trackEvent(EventCategories.company, CompanyEventActions.search, CompanySearchEventNames.noResult);
    this.searchWarning = 'Aucun établissement ne correspond à la recherche.';
  }

  treatCaseSingleResult(companySearchResult: CompanySearchResult) {
    this.analyticsService.trackEvent(EventCategories.company, CompanyEventActions.search, CompanySearchEventNames.singleResult);
    this.companies = companySearchResult.companies;
  }

  treatCaseTooManyResults() {
    this.analyticsService.trackEvent(EventCategories.company, CompanyEventActions.search, CompanySearchEventNames.tooManyResults);
    this.searchWarning = 'Il y a trop d\'établissement correspondant à la recherche.';
  }

  treatCaseSeveralResults(companySearchResult) {
    this.analyticsService.trackEvent(EventCategories.company, CompanyEventActions.search, CompanySearchEventNames.severalResult);
    this.companies = companySearchResult.companies;
  }

  treatCaseError() {
    this.analyticsService.trackEvent(EventCategories.company, CompanyEventActions.search, CompanySearchEventNames.noResult);
    this.searchError = 'Une erreur technique s\'est produite.';
  }

  selectCompanyFromResults(company: Company) {
    this.analyticsService.trackEvent(EventCategories.company, CompanyEventActions.select);
    this.selectCompany(company);
  }

  selectCompany(company: Company) {
    this.analyticsService.trackEvent(EventCategories.report, ReportEventActions.validateCompany);
    this.report.company = company;
    this.reportStorageService.changeReportInProgressFromStep(this.report, this.step);
    this.reportRouterService.routeForward(this.step);
  }

  submitCompanyForm() {
    if (!this.companyForm.valid) {
      this.showErrors = true;
    } else {
      this.analyticsService.trackEvent(EventCategories.company, CompanyEventActions.manualEntry);
      this.selectCompany(
        Object.assign(
          new Company(),
          {
            name: this.nameCtrl.value,
            line1: this.nameCtrl.value,
            line2: this.addressCtrl.value,
            postalCode: this.addressCtrlPostalCode
          }
        )
      );
    }
  }

  selectAddress(selected: CompleterItem) {
    this.addressCtrlPostalCode = '';
    if (selected) {
      this.addressCtrlPostalCode = selected.originalObject.postcode;
    }
  }

  changeCompany() {
    this.report.company = undefined;
  }

  hasError(formControl: FormControl) {
    return this.showErrors && formControl.errors;
  }
}

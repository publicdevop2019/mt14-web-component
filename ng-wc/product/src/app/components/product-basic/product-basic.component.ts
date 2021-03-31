import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { environment } from 'src/environments/environment';
import { CONSTANT_I18N } from 'src/app/classes/i18n-constant';
export interface IProductSimple {
    imageUrlSmall: string;
    name: string;
    description: string;
    lowestPrice: number;
    totalSales: number;
    id: number;
}
export interface IProductOptions {
    title: string;
    options: IProductOption[];
}
export interface IProductOption {
    optionValue: string;
    priceVar?: string;
}
export interface IProductSku {
    attributesSales: string[];
    price: number;
    storage: number;
}
export interface IProductDetail extends IProductSimple {
    imageUrlLarge?: string[];
    selectedOptions?: IProductOptions[];
    specification?: string[];
    skus: IProductSku[],
    storage?: number,
    attrIdMap: { [key: number]: string }
    attributeSaleImages?: IAttrImage[]
}
export interface IAttrImage {
    attributeSales: string,
    imageUrls: string[]
}
export interface ICartItem {
    id: string;
    finalPrice: string;
    selectedOptions: IProductOptions[];
    attributesSales: string[]
    attrIdMap: { [key: number]: string }
    imageUrlSmall: string;
    productId: number;
    name: string;
}
interface ISaleAttrUI {
    name: string;
    value: string[];
}
function notNullAndUndefinedAndEmptyString(input: any): boolean {
    return !(input === null || input === undefined || input === '');
}
@Component({
    selector: 'app-product-basic',
    templateUrl: './product-basic.component.html',
    styleUrls: ['./product-basic.component.scss']
})
export class ProductBasicComponent implements OnInit, OnDestroy, OnChanges {
    @Input() locale: 'enUS' | 'zhHans' = 'enUS';
    @Input() productDetail: IProductDetail;
    @Input() imgSize: number;
    @Output() valueChanged: EventEmitter<ICartItem> = new EventEmitter();
    public i18nLable = CONSTANT_I18N;
    public imageUrlPrefix: string = environment.imageUrl + '/'
    public salesAttr: ISaleAttrUI[] = [];
    private basePrice: number;
    public imageUrls: string[]
    public soldOut = false;
    public soldOutDismiss = false;
    constructor(public productSvc: ProductService) {

    }
    ngOnChanges(changes: SimpleChanges): void {
        // changes['locale'].currentValue
    }
    ngOnDestroy(): void {
        this.subs.forEach(sub => {
            sub && sub.unsubscribe();
        })
    }
    private loadDefaultImage() {
        if (this.productDetail.imageUrlLarge && this.productDetail.imageUrlLarge.length !== 0)
            this.imageUrls = this.productDetail.imageUrlLarge
        else
            this.imageUrls = [this.productDetail.imageUrlSmall]

    }
    ngOnInit() {
        this.loadDefaultImage()
        const optionCtrls: any = {};
        if (this.productDetail.selectedOptions)
            this.productDetail.selectedOptions.forEach(e => {
                optionCtrls[e.title] = new FormControl('', []);
            });
        this.productSvc.productDetails = this.productDetail;
        this.productSvc.formProductOption = new FormGroup(optionCtrls);
        this.productSvc.finalPrice = +this.productDetail.lowestPrice;
        this.productSvc.formProductOption.valueChanges.subscribe(next => {
            this.productSvc.finalPrice = this.calcTotal();
        });
        
        this.extracSalesInfo(this.productDetail.skus);
        this.productSvc.formProductSalesAttr.valueChanges.subscribe(next => {
            if (Object.keys(next).filter(e => next[e] === '').length === 0) {
                this.updateBasePrice(next);
                this.productSvc.finalPrice = this.calcTotal();
            }
        });
        this.dynamicUpdateAttrCtrlStatus();

        this.basePrice = +this.productDetail.lowestPrice;
        this.productSvc.formProductOption.valueChanges.subscribe(next => {
            this.valueChanged.emit(this.productSvc.extractCartItem());
        });
        this.productSvc.formProductSalesAttr.valueChanges.subscribe(next => {
            this.valueChanged.emit(this.productSvc.extractCartItem());
        })
    }
    private subs: Subscription[] = []
    dynamicUpdateAttrCtrlStatus() {
        this.subs.push(...Object.keys(this.productSvc.formProductSalesAttr.controls).map(ctrl => {
            return this.productSvc.formProductSalesAttr.get(ctrl).valueChanges.subscribe(
                next => {
                    this.updateAttrCtrl(ctrl, next)
                }
            )
        }))
    }
    public currentDisableList: string[] = [];
    private previousAdded: string[] = [];
    private previousCtrl: string = '';
    private previousCtrlValue: string = '';
    updateAttrCtrl(ctrlName: string, next: string) {
        let fg = this.productSvc.formProductSalesAttr;
        let salesAttr = Object.keys(fg.value).filter(e => (fg.get(e).value !== '' && fg.get(e).value !== null)).map(e => e + ':' + fg.get(e).value);
        let avaliableSku = this.productDetail.skus.filter(e => !(e.attributesSales.length === 1 && e.attributesSales[0] === '')).filter(e => this.containsSelected(e, salesAttr));
        let var1 = avaliableSku.map(e => e.attributesSales);
        let flattedSku: string[] = [];
        var1.forEach(e => flattedSku.push(...e));
        let toBeAdded: string[] = []
        let toBeRemoved: string[] = []
        if (ctrlName === this.previousCtrl) {
            if (!next && this.previousCtrlValue) {
                this.currentDisableList = this.currentDisableList.filter(e => !this.previousAdded.includes(e))
                return;
            }
        }
        this.salesAttr.filter(e => e.name !== ctrlName).forEach(
            e => {
                e.value.forEach(
                    ee => {
                        if (!flattedSku.includes(e.name + ':' + ee) && !this.currentDisableList.includes(e.name + ee)) {
                            toBeAdded.push(e.name + ee)
                        }
                    }
                )
            }
        )
        this.salesAttr.forEach(
            e => {
                e.value.forEach(
                    ee => {
                        if (flattedSku.includes(e.name + ':' + ee)) {
                            toBeRemoved.push(e.name + ee)
                        }
                    }
                )
            }
        )
        this.currentDisableList.push(...toBeAdded);
        this.currentDisableList = this.currentDisableList.filter(e => !toBeRemoved.includes(e));
        this.previousCtrlValue = next;
        this.previousCtrl = ctrlName;
        this.previousAdded = toBeAdded;
        if (salesAttr.length === 1 && salesAttr.filter(e => e.includes(ctrlName)).length === 0) {
            this.currentDisableList = this.currentDisableList.filter(e => !e.includes(salesAttr[0].split(":")[0]));
            this.previousCtrlValue = '';
            this.previousCtrl = '';
            this.previousAdded = [];
        }
        if (salesAttr.length === 0) {
            this.currentDisableList = [];
            this.previousCtrlValue = '';
            this.previousCtrl = '';
            this.previousAdded = [];
        }

    }
    containsSelected(e: IProductSku, salesAttr: string[]): boolean {
        return salesAttr.filter(attr => e.attributesSales.includes(attr)).length === salesAttr.length
    }
    extracSalesInfo(skus: IProductSku[]) {
        let totalStorage = 0;
        skus.forEach(sku => {
            totalStorage = totalStorage + sku.storage;
            sku.attributesSales.forEach(e => {
                let name = e.split(':')[0];
                let value = e.split(':')[1];
                let var2 = this.salesAttr.filter(e => e.name === name);
                if (var2.length > 0) {
                    if (var2[0].value.includes(value)) {
                        // do nothing for same value
                    } else {
                        var2[0].value.push(value);
                    }
                } else {
                    let var1 = <ISaleAttrUI>{
                        name: name,
                        value: [value]
                    }
                    this.salesAttr.push(var1)
                }
            })
        });
        const salesCtrls: any = {};
        if (this.salesAttr.length > 0)
            this.salesAttr.forEach(e => {
                salesCtrls[e.name] = new FormControl('', []);
            });
        this.productSvc.formProductSalesAttr = new FormGroup(salesCtrls);
        if (totalStorage === 0) {
            this.soldOut = true;
        }
    }

    calcTotal(): number {
        let vars = 0;
        let qty = 1;
        Object.keys(this.productSvc.formProductOption.controls).filter(e => e !== 'salesAttr').forEach(title => {
            if (
                notNullAndUndefinedAndEmptyString(
                    this.productSvc.formProductOption.get(title).value
                )
            ) {
                const var1: string = this.productDetail.selectedOptions
                    .filter(e => e.title === title)[0]
                    .options.filter(
                        e =>
                            e.optionValue ===
                            this.productSvc.formProductOption.get(title).value
                    )[0].priceVar;
                if (var1.indexOf('+') > -1) {
                    vars = vars + +var1.replace('+', '');
                } else if (var1.indexOf('-') > -1) {
                    vars = vars - +var1.replace('-', '');
                } else if (var1.indexOf('x') > -1) {
                    qty = +var1.replace('x', '');
                } else {
                    throw new Error(
                        "unrecognized operator, should be one of '-', '+', 'x'"
                    );
                }
            }
        });
        return +((+this.basePrice + vars) * qty).toFixed(2);
    }
    updateBasePrice(sales: any) {
        let salesAttr = Object.keys(sales).map(key => key + ":" + sales[key]).sort().join(',');
        let out = this.productDetail.skus.filter(e => e.attributesSales.sort().join(',') === salesAttr)[0];
        if (out)
            this.basePrice = out.price
    }
    getImageUrl(url: string) {
        if (url.includes('http')) {
            return url
        } else {
            return this.imageUrlPrefix + url
        }
    }
    toggleValue(ctrl: string, value: string) {
        if (this.productSvc.formProductSalesAttr.get(ctrl).value === value) {
            this.productSvc.formProductSalesAttr.get(ctrl).setValue('')
            if (this.productDetail.attributeSaleImages.find(e => e.attributeSales === (ctrl + ":" + value))) {
                this.loadDefaultImage()
            }
        }
        else {
            this.productSvc.formProductSalesAttr.get(ctrl).setValue(value);
            this.updateAttrImage(ctrl, value)
        }

    }
    updateAttrImage(ctrl: string, value: string) {
        let out = this.productDetail.attributeSaleImages.find(e => e.attributeSales === (ctrl + ":" + value));
        if (out)
            this.imageUrls = out.imageUrls
    }
    filterEmpty(sales: ISaleAttrUI[]) {
        return sales.filter(e => e.name)
    }
}

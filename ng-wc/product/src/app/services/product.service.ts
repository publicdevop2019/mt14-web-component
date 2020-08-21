import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IProductDetail, IProductOptions, ICartItem } from '../components/product-basic/product-basic.component';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    public formProductOption: FormGroup;
    public formProductSalesAttr: FormGroup;
    public productDetails: IProductDetail;
    public finalPrice: number;
    constructor() { }
    extractCartItem(): ICartItem {
        return {
            finalPrice: this.finalPrice.toString(),
            selectedOptions: this._getSelectedOptions(),
            imageUrlSmall: this.productDetails.imageUrlSmall,
            productId: this.productDetails.id,
            name: this.productDetails.name,
            attributesSales: this.getSalesAttr(),
            attrIdMap: this.productDetails.attrIdMap,
            id: ''
        } as ICartItem;
    }
    getSalesAttr(): string[] {
        if (this.productDetails.skus && this.productDetails.skus.length !== 0) {
            let sales = this.formProductSalesAttr.value
            return Object.keys(sales).map(key => key + ":" + sales[key]).sort();
        }
    }
    private _getSelectedOptions(): IProductOptions[] {
        return Object.keys(this.formProductOption.controls).map(ctrlKey => {
            return {
                title: ctrlKey,
                options: [
                    {
                        optionValue: this.formProductOption.get(ctrlKey).value
                    }
                ]
            } as IProductOptions;
        });
    }
}

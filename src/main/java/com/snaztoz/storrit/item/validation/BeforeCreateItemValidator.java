/* 
** Copyright (c) 2020 snaztoz.
** This project is under MIT License.
*/

package com.snaztoz.storrit.item.validation;

import com.snaztoz.storrit.item.Item;
import com.snaztoz.storrit.item.ItemRepository;

import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

/**
 * Validator yang digunakan untuk memvalidasikan data sebelum instance
 * dari Item dibuat (create).
 *
 * @author snaztoz
 */
@Component("beforeCreateItemValidator")
public class BeforeCreateItemValidator implements Validator {

    private ItemRepository repository;

    public BeforeCreateItemValidator(ItemRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return Item.class.isAssignableFrom(clazz);
    }

    /**
     * Memastikan bahwa Item memiliki nama, kode, dan nama satuan.
     * Untuk nama dan item haruslah unik, sedangkan untuk jumlah barang
     * tidak boleh negatif. 
     * 
     * @param target Object yang akan divalidasi (dalam kasus ini, instance dari Item).
     * @param errors Representasi dari error terkait validasi.
     */
    @Override
    public void validate(Object target, Errors errors) {
        Item item = (Item) target;

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name", "item.name.required");
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "code", "item.code.required");

        if (! isUniqueProduct(item.getName(), item.getCode()) ) {
            errors.reject("item.exist");
        }

        if (item.getAmount() < 0) {
            errors.rejectValue("amount", "item.amount.negative");
        }

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "amountUnit", "item.amountUnit.required");
    }

    /**
     * Method ini akan memastikan bahwa nama dan juga kode yang
     * akan digunakan belum ada di database.
     *
     * @param name Nama produk.
     * @param code Kode produk.
     * @return Apakah nama dan kode produk unik atau tidak.
     */
    private boolean isUniqueProduct(String name, String code) {
        return repository.findByName(name) == null
                && repository.findByCode(code) == null;
    }

}

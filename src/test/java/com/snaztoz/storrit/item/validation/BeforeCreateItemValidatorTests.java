package com.snaztoz.storrit.item.validation;

import com.snaztoz.storrit.item.Item;
import com.snaztoz.storrit.item.ItemRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class BeforeCreateItemValidatorTests {

    private final BeforeCreateItemValidator validator;
    private final ItemRepository repository;

    @Autowired
    public BeforeCreateItemValidatorTests(
            BeforeCreateItemValidator validator, ItemRepository repository) {
        this.repository = repository;
        this.validator = validator;
    }

    @AfterEach
    public void clearRepository() {
        repository.deleteAll();
    }

    @Test
    public void createValidItem() {
        Item item = new Item("chiki", "543", "bungkus");
        Errors errors = new BeanPropertyBindingResult(item, "item");
        validator.validate(item, errors);

        Item anotherItem = new Item("telur", "123", Long.valueOf(10), "box");
        Errors anotherErrors = new BeanPropertyBindingResult(anotherItem, "anotherErrors");
        validator.validate(item, errors);

        assertFalse(errors.hasGlobalErrors());
    }

    @Test
    public void createAnAlreadyExistingNameItem() {
        repository.save(new Item("chiki", "0123", "bungkus"));

        Item item = new Item("chiki", "999", "bungkus");
        Errors errors = new BeanPropertyBindingResult(item, "item");

        validator.validate(item, errors);
        assertTrue(errors.hasGlobalErrors());
    }

    @Test
    public void createAnAlreadyExistingCodeItem() {
        repository.save(new Item("chiki", "0123", "bungkus"));

        Item item = new Item("telur", "0123", "butir");
        Errors errors = new BeanPropertyBindingResult(item, "item");

        validator.validate(item, errors);
        assertTrue(errors.hasGlobalErrors());
    }

    @Test
    public void createPositiveAmountItem() {
        Item item = new Item("telur", "123", Long.valueOf(100), "butir");
        Errors errors = new BeanPropertyBindingResult(item, "items");

        validator.validate(item, errors);
        assertFalse(errors.hasFieldErrors("amount"));
    }

    @Test
    public void createNegativeAmountItem() {
        Item item = new Item("telur", "123", Long.valueOf(-5), "butir");
        Errors errors = new BeanPropertyBindingResult(item, "items");

        validator.validate(item, errors);
        assertTrue(errors.hasFieldErrors("amount"));
    }

}
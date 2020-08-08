package com.snaztoz.storrit.item;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest
public class ItemRepositoryTests {

    private ItemRepository repository;
    private List<Item> records;

    @Autowired
    public ItemRepositoryTests(ItemRepository repository) {
        this.repository = repository;

        records = Arrays.asList(
            new Item("air mineral", "123", "botol"),
            new Item("chiki", "000", "kardus"),
            new Item("telur", "512", "butir")
        );
    }

    /* Mengisi repository dengan beberapa record. */
    @BeforeEach
    public void initRepo() {
        repository.saveAll(records);
    }

    /* Menghapus semua record dari repository. */
    @AfterEach
    public void clearRepo() {
        repository.deleteAll();
    }

    @Test
    public void findExistingElementsByCode() {
        for (Item item : records) {
            assertNotNull(repository.findByCode(item.getCode()));
        }
    }

    @Test
    public void findExistingElementsByName() {
        for (Item item : records) {
            assertNotNull(repository.findByName(item.getName()));
        }
    }

    @Test
    public void findNonExistingElementsByCode() {
        List<String> codes = Arrays.asList("55555", "085");

        for (String code : codes) {
            assertNull(repository.findByCode(code));
        }
    }

    @Test
    public void findNonExistingElementsByName() {
        List<String> names = Arrays.asList("mi instan", "minyak goreng");

        for (String name : names) {
            assertNull(repository.findByName(name));
        }
    }

}
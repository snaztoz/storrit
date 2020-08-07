/* 
** Copyright (c) 2020 snaztoz.
** This project is under MIT License.
*/

package com.snaztoz.storrit.item;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

/**
 * Repositori untuk menghandle hal-hal terkait model Item dengan
 * menggunakan konsep REST.
 *
 * @author snaztoz
 */
public interface ItemRepository extends PagingAndSortingRepository<Item, Long> {

    /**
     * Mencari barang berdasarkan namanya.
     *
     * @param name Nama dari barang yang dicari.
     * @return Item dengan nama terkait.
     */
    Item findByName(@Param("name") String name);

    /**
     * Mencari barang berdasarkan kodenya.
     *
     * @param code Kode dari barang yang dicari.
     * @return Item dengan kode terkait.
     */
    Item findByCode(@Param("code") String code);

}
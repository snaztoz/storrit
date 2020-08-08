/* 
** Copyright (c) 2020 snaztoz.
** This project is under MIT License.
*/

package com.snaztoz.storrit.item;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

/**
 * Item adalah model dari barang yang ada di dalam penyimpanan.
 *
 * @author snaztoz
 */
@Entity
@Table(uniqueConstraints=
           @UniqueConstraint(columnNames={"name", "code"}))
public class Item {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    private Long amount = Long.valueOf(0);
    private String amountUnit;
    private String code;
    private String name;

    protected Item() {
    }

    /**
     * Constructor untuk model Item. Setiap Item yang dimasukkan harus 
     * memiliki nama dan juga kode yang unik antara satu produk dengan
     * produk yang lainnya.
     *
     * @param name Nama dari barang.
     * @param code Kode dari barang.
     * @param amountUnit Satuan dari jumlah barang, misal "kardus" atau "botol".
     */
    public Item(String name, String code, String amountUnit) {
        this.name = name;
        this.code = code;
        this.amountUnit = amountUnit;
    }

    /**
     * Constructor untuk model Item. Setiap Item yang dimasukkan harus 
     * memiliki nama dan juga kode yang unik antara satu produk dengan
     * produk yang lainnya.
     *
     * @param name Nama dari barang.
     * @param code Kode dari barang.
     * @param amount Jumlah barang.
     * @param amountUnit Satuan dari jumlah barang, misal "kardus" atau "botol".
     */
    public Item(String name, String code, Long amount, String amountUnit) {
        this.name = name;
        this.code = code;
        this.amount = amount;
        this.amountUnit = amountUnit;
    }

    /**
     * Mengambil jumlah dari barang (tanpa jenis satuan, untuk nama
     * satuan yang digunakan didefinisikan di field lain. Lihat
     * {@link #getAmountUnit}). Secara default, field ini bernilai 0.
     *
     * @return Jumlah barang.
     */
    public Long getAmount() {
        return this.amount;
    }

    /**
     * Mengambil nama satuan dari kuantitas barang. Misal seperti
     * "botol", atau "bungkus".
     *
     * @return Nama satuan.
     */
    public String getAmountUnit() {
        return this.amountUnit;
    }

    /**
     * Mengambil kode untuk barang tertentu. Field ini haruslah
     * unik (tidak boleh sama dengan barang lainnya).
     *
     * @return Kode barang.
     */
    public String getCode() {
        return this.code;
    }

    /**
     * Mengambil nama barang.
     *
     * @return Nama barang.
     */
    public String getName() {
        return this.name;
    }

    /**
     * Untuk memasang jumlah barang.
     *
     * @param newAmount Jumlah baru barang.
     */
    public void setAmount(Long newAmount) {
        amount = newAmount;
    }

    /**
     * Untuk memasang nama satuan barang.
     *
     * @param newAmountUnit Nama baru satuan yang akan digunakan. 
     */
    public void setAmountUnit(String newAmountUnit) {
        amountUnit = newAmountUnit;
    }

}
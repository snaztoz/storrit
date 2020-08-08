/* 
** Copyright (c) 2020 snaztoz.
** This project is under MIT License.
*/

package com.snaztoz.storrit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/**
 * Storrit adalah sebuah aplikasi yang berguna untuk memantau 
 * stok-stok barang.
 * Class ini merupakan titik masuk ke dalam program.
 *
 * p.s. untuk class konfigurasi ValidatorEventRegister hanya
 * bersifat sementara (untuk waktu yang tidak ditentukan).
 *
 * @author snaztoz
 * @see ValidatorEventsRegister
 */
@SpringBootApplication
@Import(ValidatorEventsRegister.class)
public class StorritApplication {

    public static void main(String[] args) {
        SpringApplication.run(StorritApplication.class, args);
    }

}
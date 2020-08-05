/* 
** Copyright (c) 2020 snaztoz.
** This project is under MIT License.
*/

package com.snaztoz.storrit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Storrit adalah sebuah aplikasi yang berguna untuk memantau 
 * stok-stok barang.
 * Class ini merupakan titik masuk ke dalam program.
 *
 * @author snaztoz
 */
@SpringBootApplication
public class StorritApplication {

    public static void main(String[] args) {
        SpringApplication.run(StorritApplication.class, args);
    }

}
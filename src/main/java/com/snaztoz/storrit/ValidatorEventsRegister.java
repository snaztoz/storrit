/* 
** Copyright (c) 2020 snaztoz.
** This project is under MIT License.
*/

package com.snaztoz.storrit;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.event.ValidatingRepositoryEventListener;
import org.springframework.validation.Validator;

/**
 * Class ini adalah konfigurasi untuk me-register-kan secara
 * manual event "beforeCreate".<p>
 *
 * Class ini dibuat karena terdapat bug pada Spring Framework,
 * <a href="https://jira.spring.io/browse/DATAREST-524">selengkapnya</a>.<p>
 *
 * Untuk solusi ini sendiri merupakan solusi yang didapatkan dari
 * <a href="https://www.baeldung.com/spring-data-rest-validators">sini</a>.
 */
@Configuration
public class ValidatorEventsRegister implements InitializingBean {

    @Autowired
    ValidatingRepositoryEventListener listener;

    @Autowired
    private Map<String, Validator> validators;

    @Override
    public void afterPropertiesSet() throws Exception {
        List<String> events = Arrays.asList("beforeCreate");

        for (Map.Entry<String, Validator> entry : validators.entrySet()) {
            events.stream()
                    .filter(p -> entry.getKey().startsWith(p))
                    .findFirst()
                    .ifPresent(
                        p -> listener.addValidator(p, entry.getValue())
                    );
        }
    }

}
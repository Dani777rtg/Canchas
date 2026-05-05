package com.canchas.config;

import com.canchas.common.time.BusinessTime;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class TimeConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public BusinessTime businessTime(Clock clock) {
        return new BusinessTime(clock);
    }
}

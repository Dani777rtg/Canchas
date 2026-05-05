package com.canchas.webhook.web;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/v1/webhooks/payment-provider")
public class PaymentWebhookController {

    @PostMapping
    public Map<String, Object> receive(@RequestBody(required = false) Map<String, Object> body) {
        return Map.of("received", true, "note", "Stub: validar firma del proveedor antes de produccion");
    }
}

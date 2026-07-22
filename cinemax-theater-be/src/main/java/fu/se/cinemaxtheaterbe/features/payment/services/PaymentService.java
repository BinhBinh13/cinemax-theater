package fu.se.cinemaxtheaterbe.features.payment.services;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentService {

    /**
     * Builds a redirect URL to the payment gateway for the given transaction.
     */
    String buildPaymentUrl(String txnRef, BigDecimal amount, String orderInfo, String ipAddress);

    /**
     * Verifies the authenticity of a payment gateway callback/return payload.
     */
    boolean verifySignature(Map<String, String> params);
}

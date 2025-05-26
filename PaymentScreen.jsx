// Refactored smart payment selector with real methods from CSV, improved UX, and secure email verification
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import QRCode from "react-qr-code";

function maskEmail(email) {
  const [user, domain] = email.split("@");
  return user.slice(0, 2) + "***@" + domain;
}

function useInvoiceParams() {
  return {
    amount: 1000,
    clientEmail: "john.doe@example.com",
    description: "UX/UI Consulting — 100 hours of brand identity design",
    senderName: "James Walker"
  };
}

const availableMethods = [
  {
    method: "Банковский перевод (SEPA)",
    provider: "Clear Junction",
    currencies: ["EUR"],
    fee: "0.99%",
    additional_fee: "-",
    total: 1000 * 1.0099,
    address: "DE12345678901234567890"
  },
  {
    method: "Карта (Visa, Mastercard)",
    provider: "Stripe",
    currencies: ["EUR", "USD", "GBP"],
    fee: "3.53% - 4.16%",
    additional_fee: "+2% для междунар. карт",
    total: 1000 * 1.04,
    address: "stripe_token_card"
  },
  {
    method: "Apple Pay",
    provider: "Stripe",
    currencies: ["EUR", "USD", "GBP"],
    fee: "3.53% - 4.16%",
    additional_fee: "+2% для междунар. карт",
    total: 1000 * 1.04,
    address: "stripe_token_apple"
  },
  {
    method: "Google Pay",
    provider: "Stripe",
    currencies: ["EUR", "USD", "GBP"],
    fee: "3.53% - 4.16%",
    additional_fee: "+2% для междунар. карт",
    total: 1000 * 1.04,
    address: "stripe_token_google"
  },
  {
    method: "Open Banking",
    provider: "Volt",
    currencies: ["EUR"],
    fee: "0.99%",
    additional_fee: "-",
    total: 1000 * 1.0099,
    address: "volt_payment_url"
  }
];

export default function PaymentScreen() {
  const { amount, clientEmail, description, senderName } = useInvoiceParams();
  const protectedEmail = maskEmail(clientEmail);

  const [step, setStep] = useState("verifyEmail");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const [paymentType, setPaymentType] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleCodeVerification = () => {
    setCodeError("");
    if (code.trim() === "123456") {
      setStep("chooseType");
    } else {
      setCodeError("Invalid code. Please check your email.");
    }
  };

  useEffect(() => {
    if (paymentType && currency) {
      const filtered = availableMethods.filter(m => m.currencies.includes(currency));
      setMethods(filtered);
    }
  }, [paymentType, currency]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 rounded-2xl shadow-xl bg-white text-zinc-900 font-[Gilroy_Bold] space-y-4">
      <h2 className="text-xl font-bold text-center">{senderName} requests €{amount}</h2>
      <p className="text-sm text-zinc-500 text-center">{description}</p>
      <p className="text-sm text-zinc-600 text-center">✔️ Payment due: May 30, 2025</p>

      {step === "verifyEmail" && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-700 text-center">
            For your security, we sent a 6-digit code to <strong>{protectedEmail}</strong>.
          </p>
          <p className="text-xs text-zinc-400 text-center">
            This helps us verify you're the right person to complete this payment.
          </p>
          <Input placeholder="Enter 6-digit code" value={code} onChange={e => setCode(e.target.value)} />
          {codeError && <p className="text-red-500 text-xs">{codeError}</p>}
          <Button className="w-full" onClick={handleCodeVerification}>Verify</Button>
        </div>
      )}

      {step === "chooseType" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Button className="w-full" onClick={() => { setPaymentType("fiat"); setStep("chooseCurrency"); }}>
              Pay by card or bank transfer
            </Button>
            <p className="text-xs text-zinc-500 text-center">Visa, SEPA, Apple Pay — 0,99% to 4,16% fees</p>
          </div>
          <div className="space-y-1">
            <Button className="w-full" variant="outline" onClick={() => { setPaymentType("crypto"); setStep("chooseCurrency"); }}>
              Pay with crypto
            </Button>
            <p className="text-xs text-zinc-500 text-center">BTC, ETH, USDT — instant, no KYC under €9,000</p>
          </div>
          <p className="text-[11px] text-zinc-400 text-center pt-2">🔒 Secure payment — Powered by w3are.com</p>
        </div>
      )}

      {step === "chooseCurrency" && (
        <div className="space-y-2">
          <Button variant="ghost" className="text-sm text-blue-600" onClick={() => setStep("chooseType")}>\u2190 Back</Button>
          <p className="text-sm">Select currency</p>
          <Select onValueChange={(val) => { setCurrency(val); setStep("chooseMethod"); }}>
            <SelectTrigger className="w-full">Choose currency</SelectTrigger>
            <SelectContent>
              {["EUR", "USD", "GBP"].map(cur => (
                <SelectItem key={cur} value={cur}>{cur}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {step === "chooseMethod" && (
        <div className="space-y-2">
          <Button variant="ghost" className="text-sm text-blue-600" onClick={() => setStep("chooseCurrency")}>\u2190 Back</Button>
          <p className="text-sm">Available payment methods</p>
          {methods.map(method => (
            <div
              key={method.method + method.provider}
              className="p-3 border rounded-xl flex flex-col text-sm cursor-pointer"
              onClick={() => { setSelectedMethod(method); setStep("confirm"); }}
            >
              <strong>{method.method}</strong> via {method.provider} — {method.total.toFixed(2)} {currency}
              <span className="text-xs text-zinc-500">Fee: {method.fee} {method.additional_fee && "+ " + method.additional_fee}</span>
            </div>
          ))}
        </div>
      )}

      {step === "confirm" && selectedMethod && (
        <div className="space-y-3 border p-4 rounded-xl">
          <Button variant="ghost" className="text-sm text-blue-600" onClick={() => setStep("chooseMethod")}>\u2190 Back</Button>
          <h3 className="text-sm font-semibold">Payment breakdown</h3>
          <div className="text-sm space-y-1">
            <p>Amount: €{amount}</p>
            <p>Provider fee: {selectedMethod.fee}</p>
            <p className="font-bold">Total: {selectedMethod.total.toFixed(2)} {currency}</p>
          </div>
          {paymentType === "crypto" && (
            <div className="space-y-2 text-sm">
              <div className="border rounded p-2">
                <p className="font-semibold">Send exactly:</p>
                <div className="flex justify-between items-center">
                  <span>{selectedMethod.total.toFixed(6)} {currency}</span>
                  <Copy className="w-4 h-4 cursor-pointer" onClick={() => copyToClipboard(selectedMethod.total.toFixed(6))} />
                </div>
              </div>
              <div className="border rounded p-2">
                <p className="font-semibold">To address:</p>
                <div className="flex justify-between items-center">
                  <span className="truncate max-w-[200px]">{selectedMethod.address}</span>
                  <Copy className="w-4 h-4 cursor-pointer" onClick={() => copyToClipboard(selectedMethod.address)} />
                </div>
              </div>
              <div className="flex justify-center">
                <QRCode value={selectedMethod.address} size={120} />
              </div>
            </div>
          )}
          <Button className="w-full">Confirm and Pay</Button>
        </div>
      )}
    </div>
  );
}

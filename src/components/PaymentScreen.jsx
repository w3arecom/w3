// Refactored PaymentScreen with UX and architecture improvements
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
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

const paymentOptions = {
  fiat: [
    {
      method: "Банковский перевод (SEPA)",
      provider: "Clear Junction",
      currencies: ["EUR"],
      fee: "0.99%",
      additional_fee: "-",
      address: "DE12345678901234567890"
    },
    {
      method: "Карта (Visa, Mastercard)",
      provider: "Stripe",
      currencies: ["EUR", "USD", "GBP"],
      fee: "3.53% - 4.16%",
      additional_fee: "+2% для междунар. карт",
      address: "stripe_token_card"
    },
    {
      method: "Apple Pay",
      provider: "Stripe",
      currencies: ["EUR", "USD", "GBP"],
      fee: "3.53% - 4.16%",
      additional_fee: "+2% для междунар. карт",
      address: "stripe_token_apple"
    },
    {
      method: "Google Pay",
      provider: "Stripe",
      currencies: ["EUR", "USD", "GBP"],
      fee: "3.53% - 4.16%",
      additional_fee: "+2% для междунар. карт",
      address: "stripe_token_google"
    },
    {
      method: "Open Banking",
      provider: "Volt",
      currencies: ["EUR"],
      fee: "0.99%",
      additional_fee: "-",
      address: "volt_payment_url"
    }
  ],
  crypto: [
    {
      method: "Bitcoin",
      provider: "Coinbase Commerce",
      currencies: ["BTC"],
      fee: "0%",
      additional_fee: "-",
      address: "bitcoin_wallet_address"
    },
    {
      method: "Ethereum",
      provider: "Coinbase Commerce",
      currencies: ["ETH"],
      fee: "0%",
      additional_fee: "-",
      address: "ethereum_wallet_address"
    },
    {
      method: "Tether (USDT)",
      provider: "Coinbase Commerce",
      currencies: ["USDT"],
      fee: "0%",
      additional_fee: "-",
      address: "usdt_wallet_address"
    }
  ]
};

function StepCard({ title, description, children }) {
  return (
    <div className="space-y-3 border p-4 rounded-2xl bg-zinc-50">
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
      {children}
    </div>
  );
}

function AddressDisplay({ label, value }) {
  return (
    <div className="border rounded p-2">
      <p className="font-semibold text-sm">{label}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="truncate max-w-[200px]">{value}</span>
        <Copy className="w-4 h-4 cursor-pointer" onClick={() => navigator.clipboard.writeText(value)} />
      </div>
    </div>
  );
}

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
  const [loading, setLoading] = useState(false);

  const handleCodeVerification = () => {
    setCodeError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code.trim() === "123456") setStep("chooseType");
      else setCodeError("Invalid code. Please check your email.");
    }, 500);
  };

  useEffect(() => {
    if (paymentType && currency) {
      const all = paymentOptions[paymentType];
      setMethods(all.filter(m => m.currencies.includes(currency)));
    }
  }, [paymentType, currency]);

  const totalAmount = (amount * 1.01).toFixed(2);

  return (
    <div className="max-w-md mx-auto mt-10 p-4 rounded-2xl shadow-xl bg-white text-zinc-900 font-[Gilroy_Bold] space-y-4">
      <h2 className="text-xl font-bold text-center">{senderName} requests €{amount}</h2>
      <p className="text-sm text-zinc-500 text-center">{description}</p>
      <p className="text-sm text-zinc-600 text-center">Payment due: May 30, 2025</p>

      {step === "verifyEmail" && (
        <StepCard title="Email Verification" description={`Code sent to ${protectedEmail}`}>
          <Input placeholder="Enter 6-digit code" value={code} onChange={e => setCode(e.target.value)} />
          {codeError && <p className="text-red-500 text-xs">{codeError}</p>}
          <Button className="w-full" onClick={handleCodeVerification} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </StepCard>
      )}

      {step === "chooseType" && (
        <StepCard title="Choose Payment Type">
          <Button className="w-full" onClick={() => { setPaymentType("fiat"); setStep("chooseCurrency"); }}>Card or Bank Transfer</Button>
          <Button className="w-full" variant="outline" onClick={() => { setPaymentType("crypto"); setStep("chooseCurrency"); }}>Pay with Crypto</Button>
          <p className="text-[11px] text-zinc-400 text-center pt-2">🔒 Powered by w3are.com</p>
        </StepCard>
      )}

      {step === "chooseCurrency" && (
        <StepCard title="Select Currency">
          <Button variant="secondary" className="text-sm" onClick={() => setStep("chooseType")}>← Back</Button>
          <Select onValueChange={(val) => { setCurrency(val); setStep("chooseMethod"); }}>
            <SelectTrigger className="w-full">Choose currency</SelectTrigger>
            <SelectContent>
              {(paymentType === "crypto" ? ["BTC", "ETH", "USDT"] : ["EUR", "USD", "GBP"]).map(code => (
                <SelectItem key={code} value={code}>{code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </StepCard>
      )}

      {step === "chooseMethod" && (
        <StepCard title="Available Methods">
          <Button variant="secondary" className="text-sm" onClick={() => setStep("chooseCurrency")}>← Back</Button>
          {methods.map(method => (
            <div
              key={method.method + method.provider}
              className="p-3 border rounded-xl flex flex-col text-sm cursor-pointer"
              onClick={() => { setSelectedMethod(method); setStep("confirm"); }}
            >
              <strong>{method.method}</strong> via {method.provider}<br/>
              <span className="text-xs text-zinc-500">Fee: {method.fee} {method.additional_fee && "+ " + method.additional_fee}</span>
            </div>
          ))}
        </StepCard>
      )}

      {step === "confirm" && selectedMethod && (
        <StepCard title="Review and Pay">
          <Button variant="secondary" className="text-sm" onClick={() => setStep("chooseMethod")}>← Back</Button>
          <div className="text-sm space-y-1">
            <p>Amount: €{amount}</p>
            <p>Fee: {selectedMethod.fee}</p>
            <p className="font-bold">Total: {totalAmount} {currency}</p>
            <p className="text-xs text-zinc-500">📌 Commission already included</p>
          </div>
          {paymentType === "crypto" && (
            <div className="space-y-2">
              <AddressDisplay label="Send exactly" value={`${(amount * 1.01).toFixed(6)} ${currency}`} />
              <AddressDisplay label="To address" value={selectedMethod.address} />
              <div className="flex justify-center">
                <QRCode value={selectedMethod.address} size={120} />
              </div>
              <Button variant="link" onClick={() => window.open(`https://${currency.toLowerCase()}.org/address/${selectedMethod.address}`, "_blank")}>Open in wallet</Button>
            </div>
          )}
          <Button className="w-full">Complete Payment</Button>
        </StepCard>
      )}
    </div>
  );
}

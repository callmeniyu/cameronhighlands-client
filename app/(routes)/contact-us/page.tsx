import Image from "next/image";

export default function ContactUsPage() {
  return (
    <main className="min-h-screen bg-gray-50 font-poppins pt-16">
      <section className="bg-primary text-white py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto">
          We Know What Travelers Need. We Deliver It Well.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <div className="space-y-6 text-desc_gray">
          <h2 className="text-2xl md:text-3xl font-bold text-title_black">
            We Know What Travelers Need. We Deliver It Well.
          </h2>
          <p>
            MossyForest.my helps travelers easily book licensed Mossy Forest
            tours in Cameron Highlands. We connect visitors with experienced
            local guides, professional drivers, and Land Rover experiences for a
            safe and memorable adventure.
          </p>
          <p>
            Choose from private or shared tours and explore the unique beauty of
            the Mossy Forest with confidence.
          </p>
        </div>

        <div className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <p className="text-xs uppercase tracking-wide text-desc_gray mb-2">
            Marketed by
          </p>
          <p className="text-lg font-semibold text-title_black">
            OASTEL SDN. BHD.
          </p>
          <p className="text-sm text-desc_gray">
            Company Registration No: 202401034459 (1580306-V)
          </p>
          <p className="text-sm text-desc_gray mt-2">
            WhatsApp +60 19-659 2141
          </p>
        </div>
      </section>

      <section
        id="trust-security"
        className="bg-white px-6 md:px-12 py-16 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary_green mb-3">
            Trust &amp; Security
          </h2>
          <p className="text-desc_gray max-w-2xl mx-auto">
            We partner with trusted financial institutions to ensure secure,
            reliable, and seamless transactions for all our guests.
          </p>
        </div>

        <div className="grid grid-cols-1 w gap-8 max-w-5xl mx-auto ">
          <div className="bg-gradient-to-br mx-auto from-primary_green/5 to-primary_green/10 rounded-2xl p-8 shadow-md border border-primary_green/20 h-full">
            <div className="">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-bold text-primary_green">
                  Online Payment Gateway
                </h3>
              </div>
              <div className="space-y-3 text-desc_gray">
                <div className="flex gap-2 font-semibold text-gray-800 items-center">
                  <span>Powered by</span>
                  <Image
                    src="/images/stripe-seeklogo.png"
                    alt="Stripe"
                    width={60}
                    height={20}
                    className="h-5 w-auto"
                  />
                </div>
                <ul className="space-y-2 text-sm mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary_green mt-1">✓</span>
                    <span>
                      Secure online card processing with advanced fraud
                      protection
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary_green mt-1">✓</span>
                    <span>
                      International payment support for seamless global
                      transactions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary_green mt-1">✓</span>
                    <span>PCI DSS compliant for maximum security</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-primary_green/5 rounded-lg px-6 py-4 border border-primary_green/20">
            <p className="text-sm font-semibold text-primary_green mb-1">
              OASTEL SDN. BHD.
            </p>
            <p className="text-xs text-desc_gray">
              Company Registration No: 202401034459 (1580306-V)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

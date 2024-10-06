const puppeteer = require("puppeteer");
const { PDFDocument } = require("pdf-lib");
const axios = require("axios");
const AuthSchedule = require("../../models/AuthSchedule");
const UserProperty = require("../../models/UserProperty");
const AWS = require("aws-sdk");
const sendEmail = require("../../utils/emailService");
const {
  formatCurrency,
  formatDateToAEDT,
  getVendorSignatureUrl,
} = require("../../utils/helperFunctions");
const { REACT_APP_FRONTEND_URL } = require("../../config");

const mongoose = require("mongoose");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-AU", options);
};

exports.generatePdf = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      company,
      companyAddress,
      licenseNumber,
      gst,
      abn,
      signature,
    } = req.user;
    const {
      vendors,
      solicitor,
      status,
      terms,
      saleProcess,
      startPrice,
      endPrice,
      commissionFee,
      commissionRange,
      marketing,
      propertyAddress,
      address,
      recommendedSold,
      recommendedSales,
      agreementDate,
    } = req.body.content;

    let agentSignature = req.body.content.agentSignature;

    for (const vendor of vendors) {
      if (vendor.signature) {
        vendor.signature = await getVendorSignatureUrl(vendor.signature);
      }
    }
    if (!agentSignature) {
      agentSignature = await getVendorSignatureUrl(signature);
    }

    const htmlContent = `
<header>
    <h1>
        ${
          saleProcess === "Auction"
            ? `SALES INSPECTION REPORT AND <br>
        EXCLUSIVE AUCTION AGENCY <br>
        AGREEMENT AND CONTINUING AGENCY`
            : `SALES INSPECTION REPORT AND <br>
        EXCLUSIVE SELLING AGENCY <br>
        AGREEMENT AND CONTINUING AGENCY`
        }
    </h1>
</header>

<section>
    <div>
        <h2 style="margin-bottom:1px;">PART 1 | SALES INSPECTION REPORT</h2>
        <small>SCHEDULE 2, PART 1, CLAUSE 2 OF THE PROPERTY AND STOCK AGENTS REGULATION</small>
    </div>
    <br>
    ${vendors
      .map(
        (vendor) => `
    <div>
        <h3>VENDOR</h3>
        <div><strong>NAME:</strong> ${vendor.firstName} ${vendor.lastName}</div>
        <div><strong>ADDRESS:</strong> ${vendor.address}</div>
        <div><strong>PHONE:</strong> ${vendor.mobile}</div>
        <div><strong>EMAIL:</strong> ${vendor.email}</div>
        ${
          vendor.isCompany
            ? `
        <div><strong>COMPANY:</strong> ${vendor.company}</div>
        <div><strong>ABN:</strong> ${vendor.abn}</div>
        <div><strong>GST:</strong> ${vendor.gst}</div>
        `
            : ""
        }
    </div>
    `
      )
      .join("")}
    <br>
    <div>
        <h3>LICENSEE</h3>
        <div><strong>BUSINESS NAME:</strong> ${company} <strong>ABN:</strong> ${abn} <strong>Registered for
                GST:</strong> ${gst}</div>
        <div><strong>NAME:</strong> ${name}</div>
        <div><strong>ADDRESS:</strong> ${companyAddress}</div>
        <div><strong>PHONE:</strong> ${mobile}</div>
        <div><strong>EMAIL:</strong> ${email}</div>
        <div><strong>LICENCE NUMBER:</strong> ${licenseNumber}</div>
    </div>
    <br>
    <div>
        <h3>VENDORS SOLICITOR/CONVEYANCER</h3>
        <div><strong>COMPANY NAME:</strong> ${solicitor?.name}</div>
        <div><strong>ADDRESS:</strong> ${solicitor?.address}</div>
        <div><strong>PHONE:</strong> ${solicitor?.mobile}</div>
        <div><strong>EMAIL:</strong> ${solicitor?.email}</div>
    </div>

    <br>
    <div class="page-break"></div>

    <h3>
        PROPERTY
        <small>
            [This form is for the sale of Residential Property only and not
            for Rural Land]
        </small>
    </h3>
    <strong>ADDRESS:</strong> ${propertyAddress || address}
    <div>
        <strong>Occupation status of Property: </strong>
        <span>${status}</span>
    </div>
    <div>
        <strong>
            Other terms and conditions of sale known to the Agent:
        </strong>
        <span>To be advised, as per contract, not known yet.</span>
    </div>
    <div>
        <strong>Fittings and Fixtures included in the sale: </strong>
        <span>To be advised, as per contract, not known yet.</span>
    </div>
    <div>
        <strong>Fittings and Fixtures excluded in the sale: </strong>
        <span>To be advised, as per contract, not known yet.</span>
    </div>
    <div>
        <strong>
            Details of any Covenants, Easements, Defects, Local Government
            Notices or Orders affecting the property that are known to the
            Agent:
        </strong>
        <span>To be advised, as per contract, not known yet.</span>
    </div>
    <div>
        <strong>
            Agents Recommendation as to Most Suitable Method of Sale:
        </strong>
        <span>${saleProcess}</span>
    </div>
    <div>
        <strong>
            Agents estimate of the Selling Price (or Price Range) for the
            Property:
        </strong>
        <span>
            ${startPrice} - ${endPrice}
        </span>
    </div>
    <div>
        <strong>
            Any special Instructions about Marketing and Showing of the
            Property:
        </strong>
        <span>At Agent's discretion and accompanied by an agent.</span>
    </div>
    <div class="mt-3">
        <strong>SIGNATURE OF SALES INSPECTION REPORT</strong>
    </div>
    <div>
        <p>Agents Signature</p>
        <img src=${agentSignature} alt="agent sign" class="w-auto h-8"></img>
    </div>
    <div>
        <p>
            Date of Report <br /> ${agreementDate ? agreementDate:'' }
        </p>
    </div>
</section>

<h2>
    PART 2 | PARTICULARS FOR EXCLUSIVE
    ${saleProcess === "Auction" ? "AUCTION" : "SELLING"} AGENCY AGREEMENT
    AND CONTINUING AGENCY AGREEMENT
</h2>

<section>
    <h3>
        A. AGENCY APPOINTMENT <small>[CLAUSE 2]</small>
    </h3>

    <div>
        <strong>EXCLUSIVE AGENCY PERIOD: </strong>
        <span>
            The vendor grants the Licensee exclusive selling rights over the
            Property for the period from
            <strong>${terms} days of agreement</strong>
        </span>
    </div>

    <div>
        <strong>Continuing Agency Period: </strong>
        <span>
            The Vendor grants the Licensee non-exclusive selling rights over
            the Property from the [day after above end date] being the day
            after the expiry of the Exclusive Agency Period, until the
            earlier of:
        </span>
        <ol type="a">
            <li>the sale of the Property; or </li>
            <li>
                the termination of this Agreement
            </li>
        </ol>
    </div>
</section>
<section>
    <h3>B. METHOD OF SALE</h3>

    <div>
        <strong>Method of sale: </strong>
        <span>${saleProcess}</span>
    </div>

    ${
      saleProcess === "Auction" &&
      `<div>
        <strong>Auction date: </strong>
        <span>To be confirmed</span>
    </div>`
    }
</section>
<section>
    <h3>
        ${
          saleProcess === "Auction"
            ? `C. RESERVE PRICE
        <small> (FOR AUCTION SALES) [CLAUSE 3]</small>`
            : `C. PRICE AT WHICH THE PROPERTY IS TO BE OFFERED
        <small> (FOR PRIVATE TREAT SALES) [CLAUSE 3]</small>`
        }
    </h3>

    <div>
        <strong>
            ${saleProcess === "Auction" ? "RESERVE PRICE" : "PRICE"}:
        </strong>
        <span>
            ${saleProcess === "Auction" ? "To be advised" : "Offers Invited"}
        </span>
    </div>
</section>
<section>
    <h3>
        D. LICENSEE’S REMUNERATION <small>[CLAUSE 4]</small>
    </h3>

    <div>
        <p>
            <strong>
                The Licensee’s GST inclusive commission shall be calculated on
                the GST inclusive selling price in the following way:
            </strong>
            <strong>Commission payable ${commissionFee}%</strong>
        </p>
        <p>
            [e.g. % of sale price/fixed amount/% of sale price plus fixed
            amount/other]
        </p>

        <p>
            Should the sale price be more or less than the estimated selling
            price, the commission payable shall be calculated on the sale
            price alone, at the percentage (if any) indicated above.
        </p>

        <p>
            If the Property is sold for the Licensees ESTIMATE of:
            <strong>
                ${startPrice + (endPrice ? " - " + endPrice : "")}
            </strong>
        </p>

        <p>
            the GST inclusive remuneration would be:
            <strong> ${commissionRange}</strong>
        </p>

        <p>Commission notes:</p>

        <p>
            <strong>IMPORTANT: </strong>
            <span>
                This is an exclusive agency agreement. This means you may have
                to pay the agent commission even if another agent (or you)
                sells the property or introduces a buyer who later buys the
                property.
            </span>
        </p>
        <p>
            <strong>WARNING: </strong>
            <span>
                Have you signed an agency agreement for the sale of this
                Property with another agent? If you have, you may have to pay
                2 commissions (if this agreement or the other agreement you
                have signed is a sole or exclusive agency agreement).
            </span>
        </p>
    </div>
</section>
<section>
    <h3>
        E. EXPENSES AND CHARGES <small>[CLAUSE 5]</small>
    </h3>

    <div class="col-12">
        <p>
            Government and other imposts are to be reimbursed as charged.
        </p>
        <p>
            The expenses or charges the Licensee expects to incur in
            connection with services to be provided under the Agency
            Agreement, and for which the Licensee is entitled under the
            Agency Agreement to be reimbursed (including any advertising and
            promotion costs) are as follows:
        </p>
        <p>
            Description of expense or charge, and services it is connected
            with:
        </p>
    </div>
    <div>
        <table>
            <thead class="border-bottom text-start">
                <tr>
                    <th class="py-1 pr-2">
                        Description of expense of charge, and services it is
                        connected with,
                    </th>
                    <th class="py-1 px-2">
                        Estimated or Actual (GST inclusive) See attached annexure
                    </th>
                    <th class="py-1 pl-2">
                        When reimbursement is expected to be due and payable to
                        the Licensee
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="py-1 pr-2">Total marketing expenses</td>
                    <td class="py-1 px-2 text-start">
                        As per shopping cart
                    </td>
                    <td class="py-1 pl-2 text-center">
                        Upon Invoice
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</section>
<section>
    <h3>
        F. ADVERTISING AND PROMOTION <small>[CLAUSE 6]</small>
    </h3>
    <div>
        <p>
            <strong>Manner of Advertising and Promotion: </strong>
            At Agent discretion upon meeting with Vendor/s.
        </p>
    </div>
</section>
<section>
    <h3>
        G. INSPECTION OF PROPERTY <small>[CLAUSE 7]</small>
    </h3>
    <div>
        <p>
            <strong>Manner of Inspection: </strong>
            Accompanied by an Agent.
        </p>
    </div>
</section>
<section>
    <h3>
        H. DISCLOSURE OF REBATES, DISCOUNTS, COMMISSIONS OR OTHER BENEFITS
        <small>[CLAUSE 20]</small>
    </h3>

    <div>
        <table>
            <thead class="border-bottom text-start">
                <tr>
                    <th class="py-1 pr-2">Name of source:</th>
                    <th class="py-1 px-2">Description: </th>
                    <th class="py-1 pl-2">
                        Actual or Estimate (to the extent it can reasonably be
                        estimated) (GST inclusive:)
                    </th>
                </tr>
            </thead>
            <tbody class="text-secondary">
                <tr>
                    <td class="py-1 pr-2">NIL</td>
                    <td class="py-1 px-2">NIL</td>
                    <td class="py-1 pl-2">NIL</td>
                </tr>
            </tbody>
        </table>
    </div>
</section>

<pagebreak />

<div id="editable">
    <section>
        <h3>ADDITIONAL INSTRUCTIONS</h3>
        <div>
            <p>
                Termination clause: The vendor may terminate this agreement at
                any time with one (1) days notice
            </p>
        </div>
    </section>

    <section>
        <h3>MATERIAL FACT DISCLOSURE</h3>
        <div>
            <p>
                This disclosure is to be read in conjunction with clause 9 of
                the Agreement.
            </p>
            <p>
                In accordance with the requirements pursuant to section 52(1)(b)
                of the Property and Stock Agents Act 2002 and Regulation 54 of
                the Property and Stock Agents Regulation 2014, please disclose
                whether the following material facts are applicable to the
                property the subject of this agreement.
            </p>
            <p>Don't Know.</p>
            <p>
                Building product rectification order has the same meaning as in
                the Building Products (Safety) Act 2017.
            </p>
            <p>
                External combustible cladding and fire safety order have the
                same meanings as in the Environmental Planning and Assessment
                Regulation 2000.
            </p>
        </div>
    </section>

    <section>
        <h3>ESTIMATED SELLING PRICE - EVIDENCE</h3>
        <div>
            <p>
                By signing below the Vendor acknowledges having received the
                following evidence of the reasonableness of the estimated
                selling price
            </p>
            <p>
                <strong>Comparative Market Analysis</strong>
            </p>
            <p>

                The Agent and the Vendor/s acknowledge and confirm that before
                signing this agreement the Agent and the Vendor/s have read and
                understood and agree to the terms and conditions in Part 3 of
                this agreement and the Vendor/s acknowledges being served (by
                electronic means or otherwise) with a copy of this agreement
                within 48 hours after this agreement was signed by or on behalf
                of the Licensee.
            </p>
            <p>
                The approved guide entitled “Agency Agreements for the sale of
                Residential Property” was provide to the Vendor within one month
                of this agreement being signed or on behalf of the Vendor/s
                (failure to do so is an offence)
            </p>
            <p>Yes</p>
            <p>Date Provided: ${agreementDate ? agreementDate:'' } [Clause 13].</p>
        </div>
    </section>

    <section>
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-gray-100">
                    <th class="py-2 px-3 text-start">Name</th>
                    <th class="py-2 px-3 text-start">Signature</th>
                    <th class="py-2 px-3 text-start">Date</th>
                </tr>
            </thead>
            <tbody>
                ${vendors
                  .map(
                    (vendor) => `
                <tr class="border-b">
                    <td class="py-2 px-3">${vendor.firstName} ${vendor.lastName}</td>
                    <td class="py-2 px-3"> <img src=${vendor.signature} alt="vendor sign" class="w-auto h-8"></img></td>
                    <td class="py-2 px-3">${vendor.signedDate}</td>
                </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </section>

    <pagebreak />

    <h2>
        PART 3 | TERMS AND CONDITIONS OF EXCLUSIVE
        ${saleProcess === "Auction" ? "AUCTION" : "SELLING"} AGENCY AGREEMENT
        AND CONTINUING AGENCY AGREEMENT
    </h2>

    <div class="terms">
        <ol type="1">
            <li>
                DEFINITIONS
                <ol>
                    <li>
                        "the Act" means the Property and Stock Agents Act 2002
                        (NSW).
                    </li>
                    <li>
                        "the ETA" means the Electronic Transactions Act 2000 (NSW).
                    </li>
                    <li>
                        "Agreement" means this Sales Inspection Report and Exclusive
                        ${
                          saleProcess === "Auction" ? "Auction" : "Selling"
                        } Agency
                        Agreement and Continuing Agency Agreement, including the
                        terms and conditions set out in this Part 3.
                    </li>
                    <li>
                        "Government and other imposts" includes State and Federal
                        Taxes and any tax in the nature of a goods or services tax
                        and any other taxes or charges debited by banks or financial
                        institutions against the account of the Licensee in relation
                        to sale of the Property.
                    </li>
                    <li>
                        "Introduced" – A Purchaser shall be taken to have been
                        "Introduced" to the Property or the Vendor by the Licensee,
                        by any other agent, or by any other person (including the
                        Vendor):
                        <ol type="a">
                            <li>
                                if the Purchaser becomes aware that the Property is
                                available for sale as a result of reading any
                                advertisement, notice or placard referring to the
                                availability of the Property for sale, published or
                                erected by, or in the name of, the Licensee or that
                                other agent or that other person (including the Vendor);
                                or
                            </li>
                            <li>
                                if the fact that the Property is available for sale is
                                otherwise made known to the Purchaser by or through the
                                Licensee or that other agent or that other person
                                (including the Vendor); or
                            </li>
                            <li>
                                if the Licensee or that other agent or that other person
                                (including the Vendor) is an effective cause of the
                                Sale, whether or not the Sale agreement is entered into
                                whilst this Agreement is on foot; and
                            </li>
                            <li>
                                regardless of the fact that more than one person could
                                be said to have Introduced the Purchaser to the Property
                                or the Vendor, within the meaning of this clause; and
                            </li>
                            <li>
                                regardless of whether the Purchaser is merely related to
                                or known by the person who had the actual relevant
                                dealings with the Licensee or that other agent or that
                                other person (including the Vendor); and
                            </li>
                            <li>
                                regardless of when the Purchaser came into existence or
                                acquired legal personality or capacity.
                            </li>
                        </ol>
                    </li>
                    <li>
                        "Material Fact" is a fact that would be important to a
                        reasonable person in deciding whether or not to proceed with
                        a particular transaction or a matter prescribed by the Act
                        or clause 54 Property and Stock Agents Regulation.
                    </li>
                    <li>
                        "Person" includes a corporation or representative of a
                        corporation.
                    </li>
                    <li>
                        "Purchaser" includes a person who enters into a binding
                        agreement to purchase the Property (which includes the
                        exercising of an option, or entering into any agreement that
                        is in effect, if not by name or strict legal construction, a
                        purchase of the Property), whether or not it completes.
                    </li>
                    <li>
                        "Sale" includes a binding agreement to purchase the Property
                        (which includes the exercising of an option, or entering
                        into any agreement that is in effect, if not by name or
                        strict legal construction, a purchase of the Property),
                        whether or not it completes.
                    </li>
                    <li>
                        Words importing one gender include the other and singular
                        includes the plural and vice versa (e.g. “Vendor”, if
                        applicable, refers to the vendors, when two or more people
                        own the Property).
                    </li>
                    <li>
                        A reference to includes means includes but without
                        limitation.
                    </li>
                </ol>
            </li>
            <li>
                AGENCY
                <ol>
                    <li>
                        The Vendor appoints the Licensee to sell the Property on
                        behalf of the Vendor as:
                        <ol type="a">
                            <li>
                                exclusive selling agent for the sale of the Property,
                                for the Exclusive Agency Period set out in Part 2, Item
                                A; and (b)at the expiry of the Exclusive Agency Period,
                                as non-exclusive selling agent for the sale of the
                                Property for the <br />
                                <span class="ml-1">
                                    Continuing Agency Period set out in Part 2, Item A.
                                </span>
                            </li>
                        </ol>
                    </li>
                </ol>
            </li>
            <li>
                ${saleProcess === "Auction" ? "RESERVE PRICE" : "PRICE"}
                <ol>
                    ${
                      saleProcess === "Auction"
                        ? `
                    <li>
                        If the method of sale specified in Item B of the
                        Particulars is “Auction”, the Vendor authorises the
                        Licensee to:
                        <br />
                        (a) submit the Property for sale by public auction on a
                        date agreed with the Vendor, and to appoint an
                        auctioneer as the Vendor’s auctioneer; and <br />
                        (b) sell the Property at or above the reserve price
                        stated in Item C of the Particulars, or such other
                        reserve price that the Vendor approves.
                    </li>
                    <li>
                        If no reserve price is stated in Item C of the
                        Particulars, the Vendor must give the reserve price to
                        the auctioneer in writing prior to the commencement of
                        the auction (and by doing so is taken to have given
                        their approval for the purposes of clause 3.1(b)).
                    </li>
                    <li>
                        The Vendor may at any time authorise the Licensee to
                        sell the Property by private treaty
                    </li>
                    `
                        : `
                    <li>
                        If the Property is sold by private treaty, the Vendor
                        authorises the Licensee to sell the Property at the price
                        set out in Item C of the Particulars or such other price
                        the Vendor approves.
                    </li>`
                    }
                </ol>
            </li>
            <li>
                LICENSEE’S REMUNERATION
                <ol>
                    <li>
                        Remuneration - The Licensee is entitled to the Remuneration
                        set out in Item D of the Particulars ("the Remuneration") as
                        follows:-
                        <ol type="a">
                            <li>
                                The Licensee will be entitled to the Commission set out
                                in Item D of the Particulars ("the Commission") if,
                                during the Exclusive Agency Period:
                                <ol type="i">
                                    <li>
                                        the Purchaser is Introduced to the Property or the
                                        Vendor by the Licensee, by any other agent, or by
                                        any other person (including the Vendor), whether or
                                        not a Sale of the Property occurs whilst this
                                        Agreement is on foot; or
                                    </li>
                                    <li>
                                        there is a Sale of the Property, even if the Sale
                                        does not complete (and regardless of the cause of
                                        the Sale not completing).
                                    </li>
                                </ol>
                            </li>
                            <li>
                                The Licensee will be entitled to the Commission if,
                                during the Continuing Agency Period:
                                <ol type="i">
                                    <li>
                                        the Purchaser is Introduced to the Property or the
                                        Vendor by the Licensee, by an agent who is not
                                        lawfully appointed pursuant to the Act, or by any
                                        other person (including the Vendor), whether or not
                                        a Sale of the Property occurs whilst this Agreement
                                        is on foot; or
                                    </li>
                                    <li>
                                        there is a Sale of the Property other than a Sale
                                        resulting from the Purchaser being Introduced to the
                                        Property or the Vendor during the Continuing Agency
                                        Period by another agent lawfully appointed pursuant
                                        to the Act, even if the Sale does not complete (and
                                        regardless of the cause of the Sale not completing).
                                    </li>
                                </ol>
                            </li>
                            <li>
                                The Commission is due and payable by the Vendor to the
                                Licensee immediately and in full when the Sale of the
                                Property completes.
                            </li>
                            <li>
                                If, after the Vendor and the Purchaser have entered into
                                a binding agreement for the Sale of the Property:
                                <ol type="i">
                                    <li>
                                        the Vendor and the Purchaser enter into a mutual
                                        agreement (whether written or verbal) to rescind the
                                        agreement or otherwise not proceed with the Sale; or
                                    </li>
                                    <li>
                                        the agreement is terminated as a result of the
                                        default of the Vendor; or
                                    </li>
                                    <li>
                                        the agreement is terminated as a result of the
                                        default of the Purchaser (regardless of the amount
                                        of the deposit which has been paid at the date of
                                        termination, and regardless of the amount of the
                                        deposit which is forfeited to or recoverable by the
                                        Vendor); or
                                    </li>
                                    <li>
                                        the Vendor does not proceed with the Sale for any
                                        other reason (including a postponement of the
                                        completion of the Sale for more than 30 days after
                                        the original completion date),
                                        <br />
                                        <span class="ml-2">
                                            the Commission will become due and payable by the
                                            Vendor to the Licensee immediately.
                                        </span>
                                    </li>
                                </ol>
                            </li>
                            <li>
                                The Commission is calculated (as set out in Item D of
                                the Particulars) on the selling price, and is inclusive
                                of GST.
                                <p class="ml-2">
                                    WARNING: The term immediately above provides that a
                                    commission is payable under this agreement even if the
                                    sale of the property is not completed.
                                </p>
                                <p class="ml-2">
                                    IMPORTANT: This is an exclusive agency agreement. This
                                    means you may have to pay the agent commission even if
                                    another agent (or you) sells the property or
                                    introduces a buyer who later buys the property.
                                </p>
                                <p class="ml-2">
                                    WARNING: Have you signed an agency agreement for the
                                    sale of this Property with another agent? If you have
                                    you may have to pay 2 commissions (if this agreement
                                    or the other agreement you have signed is a sole or
                                    exclusive agency agreement).
                                </p>
                            </li>
                        </ol>
                    </li>
                    <li>
                        Authority to Deduct – The Licensee may, upon receipt of a
                        direction from the Purchaser or their Legal Representative
                        authorising the Licensee to account to the Vendor for the
                        deposit, deduct from the deposit all or part of the
                        Remuneration, and all or part of the Expenses and Charges
                        that are payable to the Licensee pursuant to this Agreement,
                        up to the entire amount of the deposit.
                    </li>
                    <li>
                        Variation - The Remuneration provided for in this Agreement
                        (that is, both the Commission and the Other Services) cannot
                        be varied except as agreed in writing by the Vendor.
                    </li>
                </ol>
            </li>
            <li>
                EXPENSES AND CHARGES
                <ol>
                    <li>
                        The Vendor must reimburse the Licensee for the expenses and
                        charges incurred and described in Item E of the Particulars.
                        Those services and amounts cannot be varied except with the
                        agreement in writing of the Vendor.
                    </li>
                    <li>
                        The reimbursement is due and payable as and when the Vendor
                        is notified by the Licensee that the expenses or charges
                        have been incurred.
                    </li>
                    <li>
                        The actual amount incurred is to be reimbursed (including
                        any additional GST which the Licensee is or becomes liable
                        to pay to the Commonwealth), even if it exceeds the estimate
                        (if any) that is given in Item E.
                    </li>
                    <li>
                        Variation - The Expenses and Charges provided for in this
                        Agreement cannot be varied except as agreed in writing by
                        the Vendor.
                    </li>
                </ol>
            </li>
            <li>
                ADVERTISING AND PROMOTION
                <ol>
                    <li>
                        The Licensee will advertise or otherwise promote the
                        Property as set out in Item F of the Particulars.
                    </li>
                    <li>
                        If the Licensee is to pay any advertising or promotion
                        costs, they are to be included in Item E as “Expenses and
                        Charges”.
                    </li>
                    <li>
                        The Licensee is authorised to erect a For Sale sign at the
                        Property unless instructed differently.
                    </li>
                    <li>
                        The Vendor acknowledges that the Licensee is not responsible
                        for any liability, injury or damage incurred as a result of
                        the sign being erected at the Property.
                    </li>
                </ol>
            </li>
            <li>
                CONJUNCTION AGENTS
                <ol>
                    <li>
                        The Vendor acknowledges that the Licensee is authorised to
                        act in conjunction with another licensed real estate agent
                        to market and sell the Property, however the Licensee is not
                        authorised to offer any payment to the conjunction agent
                        other than a payment that is made by, or from monies owing
                        to, the Licensee.
                    </li>
                    <li>
                        For the avoidance of doubt, and notwithstanding any other
                        provision in this Agreement:
                        <ol>
                            <li>
                                the Licensee is forbidden to pay any conjunction fee or
                                any other payment in the nature of a referral fee to a
                                person who is not appropriately licensed under the Act
                                or under any other legislation applicable to them;
                            </li>
                            <li>
                                the use of a conjunction agent does not increase the
                                amount of, or vary in any way, the Remuneration or the
                                Expenses and Charges, unless expressly agreed in
                                writing; and
                            </li>
                            <li>
                                if during the Continuing Agency Period, a Sale of the
                                Property results from the Licensee acting as a
                                conjunction agent (as opposed to the Licensee using a
                                conjunction agent), the Licensee is not entitled to be
                                paid any of the Commission, but is permitted to accept
                                payment from monies that are held by or owing to that
                                other licensed agent.
                            </li>
                        </ol>
                    </li>
                </ol>
            </li>
            <li>
                MATERIAL FACTS
                <ol>
                    <li>
                        The Vendor acknowledges that pursuant to the Act and clause
                        54 Property and Stock Agents Regulation, the Licensee is
                        required to disclose all “Material Facts” relating to the
                        Property to any prospective or actual purchaser.
                    </li>
                    <li>
                        The Vendor warrants that they have provided to the Licensee
                        all information which may be considered a “Material Fact” in
                        relation to the Property and they have completed the
                        Material Fact disclosure document which forms part of this
                        Agreement.
                    </li>
                    <li>
                        The Vendor warrants that if they become aware of any further
                        information that may be considered a Material Fact after
                        entering into this Agreement they will immediately provide
                        that information to the Licensee.
                    </li>
                    <li>
                        The Vendor authorises and directs the Licensee to disclose
                        anything which may be a “Material Fact” in relation to the
                        Property to any actual or prospective purchaser of the
                        Property.
                    </li>
                    <li>
                        The Vendor indemnifies the Licensee against all actions,
                        claims and demands brought against, and all costs, losses
                        and liabilities incurred by the Licensee arising from or
                        connected with a failure on the part of the Vendor to
                        disclose a “Material Fact” or as a result, howsoever caused,
                        of the Vendor providing false, misleading or deceptive
                        information to the Licensee.
                    </li>
                </ol>
            </li>
            <li>
                DEPOSIT
                <ol>
                    <li>
                        The Vendor agrees that any deposit paid in accordance with
                        an agreement for the sale of the Property will be held in
                        the Trust Account of the Licensee as stakeholder, as
                        directed by the parties, pending completion of the sale.
                    </li>
                </ol>
            </li>
            <li>
                FINANCIAL INSTITUTION TAXES OR DEDUCTIONS
                <ol>
                    <li>
                        If the Licensee incurs any taxes or deductions debited by
                        banks or other financial institutions against the Licensee’s
                        account, that relate to the affairs of the Vendor, the
                        Licensee is entitled to be reimbursed for the charges it
                        incurs.
                    </li>
                </ol>
            </li>
            <li>
                PAYMENT TO THE VENDOR
                <ol>
                    <li>
                        If any money that is held by the Licensee in respect of this
                        Agreement becomes due and payable to the Vendor, the Vendor
                        directs the Licensee to pay the money by cheque or
                        electronic funds transfer to the Vendor's bank account.
                    </li>
                </ol>
            </li>
            <li>
                APPROVED GUIDE
                <ol>
                    <li>
                        The Vendor confirms that prior to (but no more than 1 month
                        prior to) the Vendor signing this Agreement, the Licensee
                        has provided the Vendor with a copy of the approved guide
                        entitled ‘Agency Agreements for the Sale of Residential
                        Property’.
                    </li>
                </ol>
            </li>
            <li>
                CONTRACT FOR SALE
                <ol>
                    <li>
                        The Licensee must not offer the Property (if the Property is
                        a residential property), for sale unless a copy of the
                        proposed contract for the sale of the Property (including
                        all mandatory disclosure documents required by section 52A
                        of the Conveyancing Act 1919) is available for inspection by
                        prospective purchasers at the Licensee’s registered office.
                    </li>
                    <li>
                        The Vendor must provide to the Licensee a copy of the
                        contract for sale as soon as it is practicable.
                    </li>
                    <li>
                        The Licensee is not authorised to sign a contract for sale
                        on behalf of the Vendor.
                    </li>
                </ol>
            </li>
            <li>
                INDEMNITY
                <ol>
                    <li>
                        The Agent having complied with its obligations under this
                        Agreement and not having been negligent, the Vendor
                        indemnifies the Agent, its officers and employees, from and
                        against all actions, claims, demands, losses, costs damages
                        and expenses arising out of this Agreement in respect of:
                        <br />
                        <ol type="i">
                            <li> authorised sales advertising and signage; or</li>
                            <li>

                                the Vendor's failure to comply with this Agreement; or
                            </li>
                            <li>

                                the Vendor's failure to give the Agent prompt and
                                appropriate authority or instruction, or sufficient
                                funds to carry out an instruction or authority; or
                            </li>
                            <li>

                                the Agent acting on behalf of the Vendor under this
                                Agreement; or
                            </li>
                            <li>

                                the Agent incurring legal costs of employing the
                                services of a credit collection agency to recover unpaid
                                debts; or
                            </li>
                            <li>

                                any claim for compensation in respect of damage or loss
                                to the Vendor's goods; or
                            </li>
                            <li>

                                a warning label or safety instructions having been
                                removed, damaged or defaced where a product or fitting
                                has been supplied to the Property with such a label or
                                instruction attached.
                            </li>
                        </ol>
                    </li>
                </ol>
            </li>
            <li>
                WARRANTY BY THE VENDOR
                <ol>
                    <li>
                        The Vendor warrants to the Licensee that the Vendor has any
                        necessary authority to enter into this Agreement with the
                        Licensee.
                    </li>
                </ol>
            </li>
            <li>
                GST
                <ol>
                    <li>
                        In this clause, GST Law has the meaning given in the A New
                        Tax System (Goods and Services Tax) Act 1999 (Cth), and
                        terms used which are not defined in this Agreement but which
                        are defined in the GST Law, have the meanings given in the
                        GST Law.
                    </li>
                    <li>
                        Unless stated otherwise, all consideration provided under or
                        referred to in this Agreement is stated as an amount that is
                        inclusive of GST, at the rate of 10%. If the rate of GST is
                        increased or decreased, the Vendor and the Licensee agree
                        that these GST inclusive amounts will be varied to reflect
                        that increase or decrease. The time of supply for the
                        purposes of the GST Law is the time when the consideration
                        is payable pursuant to this Agreement.
                    </li>
                    <li>
                        The Vendor must pay to the Licensee any GST payable in
                        respect of any taxable supply made by the Licensee to the
                        Vendor. Upon request by the Vendor, the Licensee will
                        provide a tax invoice in respect of any such taxable supply.
                    </li>
                </ol>
            </li>
            <li>
                PRIVACY NOTICE
                <ol>
                    <li>
                        The Privacy Act 1988 (Cth) regulates the collection, use,
                        storage and disclosure of personal information of the Vendor
                        by the Licensee.
                    </li>
                    <li>
                        The information is collected by and pursuant to this
                        Agreement.
                    </li>
                    <li>
                        The information collected enables the Licensee to act for
                        and on behalf of the Vendor and to carry out effectively the
                        Licensee’s obligations under and pursuant to the terms of
                        this Agreement and to perform and promote the real estate
                        agency services of the Licensee. Some of the information is
                        required by law and without it the Licensee may not be able
                        to act for and on behalf of the Vendor.
                    </li>
                    <li>
                        The intended recipients of the information are any person to
                        whom, and any body or agency to which, it is usual to
                        disclose the information to enable the Licensee to perform
                        the services under or pursuant to this Agreement, real
                        estate agency services, or to otherwise act as permitted by
                        the Privacy Act 1988, including potential tenants, actual or
                        potential landlords, contractors (tradespeople), print and
                        electronic media, internet, State or Federal authorities, or
                        organisations (as well as owners’ corporations and community
                        associations).
                    </li>
                    <li>
                        The Vendor has the right to access the information and may
                        do so by contacting the Licensee. The Vendor has the right
                        to require correction of the information if it is not
                        accurate, up-to-date and complete.
                    </li>
                </ol>
            </li>
            <li>
                FINANCIAL AND INVESTMENT ADVICE
                <ol>
                    <li>
                        WARNING: Any financial or investment advice provided to the
                        Vendor by the Licensee is general advice and does not take
                        into account the individual circumstances of the Vendor or
                        the Vendor’s objectives, financial situation or needs. The
                        Vendor must seek and rely on their own independent financial
                        and investment advice from an appropriately licensed
                        financial adviser.
                    </li>
                </ol>
            </li>
            <li>
                REBATES, DISCOUNTS, COMMISSIONS AND OTHER BENEFITS
                <ol>
                    <li>
                        The Licensee has made a reasonable attempt to set out in
                        Item H of the Particulars any rebates, discounts,
                        commissions, or other benefits that the Licensee will or may
                        receive in respect of the expenses charged under this
                        Agreement, and the estimated amount of those rebates,
                        discounts, commissions, or other benefits (to the extent
                        that the amount can reasonably be estimated). The Vendor
                        agrees that the Licensee is entitled to retain all such
                        rebates, discounts, commissions, or other benefits.
                    </li>
                </ol>
            </li>
            <li>
                LIMIT OF LICENSEE’S SERVICES
                <ol>
                    <li>
                        The Licensee will not undertake any other services in
                        connection with the sale of the Property, other than the
                        services listed in this Agreement.
                    </li>
                </ol>
            </li>
            <li>
                CONSTRUCTION OF THIS AGREEMENT, INCLUDING ADDITIONAL CLAUSES
                <ol>
                    <li>
                        If a provision of this Agreement (including any amendments
                        to it, or any additional clauses or special conditions
                        inserted in it) is illegal or unenforceable (including as a
                        result of being found either to be uncertain, or to give
                        rise to uncertainty when read in conjunction with the
                        original text of this Agreement, or to not give rise to a
                        legally binding agreement), that provision may be severed
                        and the remainder of this Agreement will continue in force.
                    </li>
                </ol>
            </li>
            <li>
                ELECTRONIC SIGNATURES
                <ol>
                    <li>
                        The Licensee and the Vendor agree that, by typing or
                        entering the text of their names where and when requested to
                        do so:
                        <ol type="a">
                            <li>
                                they are acknowledging and warranting that by doing so,
                                they are identifying themselves to each other (including
                                identifying themselves, as applicable, as either offeror
                                or offeree), for the purposes of the ETA or any other
                                applicable law;
                            </li>
                            <li>
                                they will have signed this Agreement or affixed their
                                signature to it, for the purposes of the ETA or any
                                other applicable law that requires this Agreement to be
                                signed by the Licensee or the Vendor;
                            </li>
                            <li>
                                this Agreement will thereby contain their electronic
                                signature, for the purposes of the ETA or any other
                                applicable law; (d)they will be expressing and
                                confirming their immediate intention to be legally bound
                                by this Agreement, which they acknowledge contains all
                                of the terms of the agreement between them, and is the
                                finalised form of the agreement between them;
                            </li>
                            <li>
                                they are consenting to each other identifying
                                themselves, signing this Agreement, and expressing their
                                intentions as referred to in this clause, in this way;
                            </li>
                            <li>
                                they are agreeing that this Agreement is in writing,
                                that this Agreement has been signed by them, that their
                                signature and other information contained in this
                                Agreement has been given or provided in writing, and
                                that nothing in the electronic format of this Agreement
                                (including the method of signing it) affects the legally
                                binding and enforceable nature of this Agreement; and
                            </li>
                            <li>
                                they will be representing the matters in the previous
                                sub-clause to one another, and in turn will be acting in
                                reliance on each other’s representations to that same
                                effect.
                            </li>
                        </ol>
                    </li>
                </ol>
            </li>
        </ol>
    </div>
</div>

<br>
<div class="page-break"></div>
<div>
      <h3 class="text-center">SOLD MATCHES</h3>
      ${
        recommendedSold.length > 0
          ? `
      <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse">
              <thead>
                  <tr class="bg-gray-100">
                      <th class="py-2 px-3 text-start">Address</th>
                      <th class="py-2 px-3 text-start">Price</th>
                      <th class="py-2 px-3 text-start">Score Match</th>
                  </tr>
              </thead>
              <tbody>
                  ${recommendedSold
                    .map(
                      (item) => `
                  <tr class="border-b">
                      <td class="py-2 px-3">${item.address}</td>
                      <td class="py-2 px-3">${formatCurrency(item.price)}</td>
                      <td class="py-2 px-3">${item.score}%</td>
                  </tr>
                  `
                    )
                    .join("")}
              </tbody>
          </table>
      </div>
      `
          : ""
      }
  </div>
  
  <br>
  
  <div>
      <h3 class="text-center">SALE MATCHES</h3>
      ${
        recommendedSales.length > 0
          ? `
      <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse">
              <thead>
                  <tr class="bg-gray-100">
                      <th class="py-2 px-3 text-start">Address</th>
                      <th class="py-2 px-3 text-start">Price</th>
                      <th class="py-2 px-3 text-start">Score Match</th>
                  </tr>
              </thead>
              <tbody>
                  ${recommendedSales
                    .map(
                      (item) => `
                  <tr class="border-b">
                      <td class="py-2 px-3">${item.address}</td>
                      <td class="py-2 px-3">${formatCurrency(item.price)}</td>
                      <td class="py-2 px-3">${item.score}%</td>
                  </tr>
                  `
                    )
                    .join("")}
              </tbody>
          </table>
      </div>
      `
          : ""
      }
  </div>

<br>
<div class="page-break"></div>
<div>
    <h3 class="text-center">MARKETING</h3>
    <table class="w-full border">
        <tbody>
            ${marketing?.marketingItems
              ?.map(
                (item) => `
            <tr key={index} class="border-b">
                <td class="px-4 py-2">${item.name}</td>
                <td class="px-4 py-2"></td>
            </tr>`
              )
              .join("")}

            <tr>
                <td class="border px-4 py-2 font-bold">TOTAL</td>
                <td class=" px-4 py-2 flex items-center">
                    ${marketing.marketingPrice}
                </td>
            </tr>
        </tbody>
    </table>
</div>`;

    const styledhtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
<style>
.page-break {
  page-break-before: always; /* For print context */
  break-before: page;        /* Modern browser support */
}

.terms-condition {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px !important;
  line-height: 1.6;
  /* padding: 60px; */
  padding: 8px;
}

/* ----------------------------------- *
*   Typography
* ----------------------------------- */
.terms-condition h1 {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 700 !important;
  margin: 1rem 0rem;
}

.terms-condition h2 {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  font-weight: 700 !important;
  margin: 0.5rem 0rem;
}

.terms-condition h3 {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  line-height: 1.6;
  font-weight: 700 !important;
  margin: 0.3rem 0rem;
}

.terms-condition h4 {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  line-height: 1.6;
  font-weight: 700 !important;
  margin: 0.2rem 0rem;
}

.terms-condition h5 {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8px;
  color: #666666;
}

.terms-condition p {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  margin-bottom: 0.5rem;
}

.terms-condition span {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
}

.terms-condition strong {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
}

.terms-condition ol {
  font-family: Arial, Helvetica, sans-serif;
  padding-left: 0.5rem;
  position: relative;
  margin-top: 0.3rem;
  font-size: 10px;
}

td, th, tr {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
}

.terms-condition ol[type="a"] {
  list-style-type: lower-alpha;
}

.terms-condition ol[type="i"] {
  list-style-type: lower-roman; /* Ensure Roman numerals are used */
}

.terms-condition ol li {
  font-family: Arial, Helvetica, sans-serif;
  margin-bottom: 0.3rem;
  font-size: 10px;
}

.terms > ol {
  font-family: Arial, Helvetica, sans-serif;
  padding-left: 0rem;
  margin-left: 0rem;
  counter-reset: item;
}

.terms > ol > li {
  font-family: Arial, Helvetica, sans-serif;
  display: block;
}

.terms > ol > li:before {
  font-family: Arial, Helvetica, sans-serif;
  content: counters(item, ". ") ". ";
  counter-increment: item;
}

.terms > ol > li > ol {
  font-family: Arial, Helvetica, sans-serif;
  counter-reset: item;
  padding-left: 0.5rem;
  margin-left: 0rem;
}

.terms > ol > li > ol > li {
  font-family: Arial, Helvetica, sans-serif;
  display: block;
  padding-left: 0.5rem;
  margin-left: 0rem;
}

.terms > ol > li > ol > li:before {
  font-family: Arial, Helvetica, sans-serif;
  content: counters(item, ". ") ". ";
  counter-increment: item;
}

.terms-condition small {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 8px;
  color: #9f9f9f;
  font-weight: normal;
}

</style>
</head>
<body>
<div class="terms-condition">
  ${htmlContent}
</div>
</body>
</html>
`;

    // this script for production
    const launchOptions = {
      headless: true, // Run in headless mode
      ignoreDefaultArgs: ["--disable-extensions"],
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
      dumpio: false,
      timeout: 120000,
    };

    // Add executablePath only if environment is PROD
    if (process.env.ENVIRONMENT === "PROD") {
      launchOptions.executablePath = "/usr/bin/google-chrome-stable";

      // launchOptions.executablePath = "/usr/bin/chromium-browser"; // Path to the installed Chromium on Ubuntu
    }

    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(styledhtmlContent, { waitUntil: "networkidle0" });

    // Define footer with page number
    const footerTemplate = `
    <div style="width: 100%; font-size: 8px; font-family: Arial, Helvetica, sans-serif; text-align: center; color: #333; padding: 5px 10px;">
      <div style="width: 100%; padding-top: 5px; font-weight: 700;">
        <span style="text-align:center; font-size: 10px; letter-spacing: 2px;margin-left:16px;">AUSREALTY</span>
        <span style="float: right; font-size: 10px;margin-right:16px;">Page <span class="pageNumber"></span></span>
      </div>
    </div>`;

    //   const pdfBuffer = await page.pdf({ format: 'A4' });
    const generatedPdfBuffer = await page.pdf({
      path: "agreement.pdf",
      format: "A4",
      margin: {
        top: "20mm",
        right: "10mm",
        bottom: "20mm",
        left: "10mm",
      },
      displayHeaderFooter: true,
      footerTemplate: footerTemplate,
      headerTemplate: `<div style="display: none;"></div>`,
      printBackground: true,
    });

    await browser.close();

    // Step 1: Fetch external PDF
    const externalPdfUrl =
      "https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/files/FTR32_Agency_agreement.pdf";
    const externalPdfResponse = await axios.get(externalPdfUrl, {
      responseType: "arraybuffer",
    });
    const externalPdfBytes = externalPdfResponse.data;

    // Step 2: Load both PDFs
    const pdfDoc = await PDFDocument.load(generatedPdfBuffer);
    const externalPdfDoc = await PDFDocument.load(externalPdfBytes);

    // Step 3: Copy pages from external PDF to generated PDF
    const externalPages = await pdfDoc.copyPages(
      externalPdfDoc,
      externalPdfDoc.getPageIndices()
    );
    externalPages.forEach((page) => pdfDoc.addPage(page));

    // Step 4: Final merged PDF
    const mergedPdfBytes = await pdfDoc.save();

    // Set the response headers and send the merged PDF as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=merged-agency-agreement.pdf"
    );
    res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateAgreement = async (agent, content, propertyId) => {
  try {
    const {
      name,
      email,
      mobile,
      company,
      companyAddress,
      licenseNumber,
      gst,
      abn,
      signature
    } = agent;
// Create a deep copy of content
const contentCopy = structuredClone(content);
    
const {
  vendors,
  solicitor,
  status,
  terms,
  saleProcess,
  startPrice,
  endPrice,
  commissionFee,
  commissionRange,
  marketing,
  propertyAddress,
  recommendedSold,
  recommendedSales,
  agentSignature,
  agreementDate,
} = contentCopy;

    for (const vendor of vendors) {
      if (vendor.signature) {
        vendor.signature = await getVendorSignatureUrl(vendor.signature);
      }
    }
    if (!agentSignature) {
      agentSignature = await getVendorSignatureUrl(signature);
    }

    const agreementContent = `
  <header>
      <h1>
          ${
            saleProcess === "Auction"
              ? `SALES INSPECTION REPORT AND <br>
          EXCLUSIVE AUCTION AGENCY <br>
          AGREEMENT AND CONTINUING AGENCY`
              : `SALES INSPECTION REPORT AND <br>
          EXCLUSIVE SELLING AGENCY <br>
          AGREEMENT AND CONTINUING AGENCY`
          }
      </h1>
  </header>
  
  <section>
      <div>
          <h2 style="margin-bottom:1px;">PART 1 | SALES INSPECTION REPORT</h2>
          <small>SCHEDULE 2, PART 1, CLAUSE 2 OF THE PROPERTY AND STOCK AGENTS REGULATION</small>
      </div>
      <br>
      ${vendors
        .map(
          (vendor) => `
      <div>
          <h3>VENDOR</h3>
          <div><strong>NAME:</strong> ${vendor.firstName} ${
            vendor.lastName
          }</div>
          <div><strong>ADDRESS:</strong> ${vendor.address}</div>
          <div><strong>PHONE:</strong> ${vendor.mobile}</div>
          <div><strong>EMAIL:</strong> ${vendor.email}</div>
          ${
            vendor.isCompany
              ? `
          <div><strong>COMPANY:</strong> ${vendor.company}</div>
          <div><strong>ABN:</strong> ${vendor.abn}</div>
          <div><strong>GST:</strong> ${vendor.gst}</div>
          `
              : ""
          }
      </div>
      `
        )
        .join("")}
      <br>
      <div>
          <h3>LICENSEE</h3>
          <div><strong>BUSINESS NAME:</strong> ${company} <strong>ABN:</strong> ${abn} <strong>Registered for
                  GST:</strong> ${gst}</div>
          <div><strong>NAME:</strong> ${name}</div>
          <div><strong>ADDRESS:</strong> ${companyAddress}</div>
          <div><strong>PHONE:</strong> ${mobile}</div>
          <div><strong>EMAIL:</strong> ${email}</div>
          <div><strong>LICENCE NUMBER:</strong> ${licenseNumber}</div>
      </div>
      <br>
      <div>
          <h3>VENDORS SOLICITOR/CONVEYANCER</h3>
          <div><strong>COMPANY NAME:</strong> ${solicitor?.name}</div>
          <div><strong>ADDRESS:</strong> ${solicitor?.address}</div>
          <div><strong>PHONE:</strong> ${solicitor?.mobile}</div>
          <div><strong>EMAIL:</strong> ${solicitor?.email}</div>
      </div>
  
      <br>
      <div class="page-break"></div>
  
      <h3>
          PROPERTY
          <small>
              [This form is for the sale of Residential Property only and not
              for Rural Land]
          </small>
      </h3>
      <strong>ADDRESS:</strong> ${propertyAddress}
      <div>
          <strong>Occupation status of Property: </strong>
          <span>${status}</span>
      </div>
      <div>
          <strong>
              Other terms and conditions of sale known to the Agent:
          </strong>
          <span>To be advised, as per contract, not known yet.</span>
      </div>
      <div>
          <strong>Fittings and Fixtures included in the sale: </strong>
          <span>To be advised, as per contract, not known yet.</span>
      </div>
      <div>
          <strong>Fittings and Fixtures excluded in the sale: </strong>
          <span>To be advised, as per contract, not known yet.</span>
      </div>
      <div>
          <strong>
              Details of any Covenants, Easements, Defects, Local Government
              Notices or Orders affecting the property that are known to the
              Agent:
          </strong>
          <span>To be advised, as per contract, not known yet.</span>
      </div>
      <div>
          <strong>
              Agents Recommendation as to Most Suitable Method of Sale:
          </strong>
          <span>${saleProcess}</span>
      </div>
      <div>
          <strong>
              Agents estimate of the Selling Price (or Price Range) for the
              Property:
          </strong>
          <span>
              ${startPrice} - ${endPrice}
          </span>
      </div>
      <div>
          <strong>
              Any special Instructions about Marketing and Showing of the
              Property:
          </strong>
          <span>At Agent's discretion and accompanied by an agent.</span>
      </div>
      <div class="mt-3">
          <strong>SIGNATURE OF SALES INSPECTION REPORT</strong>
      </div>
      <div>
          <p>Agents Signature</p>
          <img src=${agentSignature} alt="agent sign" class="w-auto h-8"></img>
      </div>
      <div>
          <p>
              Date of Report <br /> ${agreementDate ? agreementDate:'' }
          </p>
      </div>
  </section>
  
  <h2>
      PART 2 | PARTICULARS FOR EXCLUSIVE
      ${saleProcess === "Auction" ? "AUCTION" : "SELLING"} AGENCY AGREEMENT
      AND CONTINUING AGENCY AGREEMENT
  </h2>
  
  <section>
      <h3>
          A. AGENCY APPOINTMENT <small>[CLAUSE 2]</small>
      </h3>
  
      <div>
          <strong>EXCLUSIVE AGENCY PERIOD: </strong>
          <span>
              The vendor grants the Licensee exclusive selling rights over the
              Property for the period from
              <strong>${terms} days of agreement</strong>
          </span>
      </div>
  
      <div>
          <strong>Continuing Agency Period: </strong>
          <span>
              The Vendor grants the Licensee non-exclusive selling rights over
              the Property from the [day after above end date] being the day
              after the expiry of the Exclusive Agency Period, until the
              earlier of:
          </span>
          <ol type="a">
              <li>the sale of the Property; or </li>
              <li>
                  the termination of this Agreement
              </li>
          </ol>
      </div>
  </section>
  <section>
      <h3>B. METHOD OF SALE</h3>
  
      <div>
          <strong>Method of sale: </strong>
          <span>${saleProcess}</span>
      </div>
  
      ${
        saleProcess === "Auction" &&
        `<div>
          <strong>Auction date: </strong>
          <span>To be confirmed</span>
      </div>`
      }
  </section>
  <section>
      <h3>
          ${
            saleProcess === "Auction"
              ? `C. RESERVE PRICE
          <small> (FOR AUCTION SALES) [CLAUSE 3]</small>`
              : `C. PRICE AT WHICH THE PROPERTY IS TO BE OFFERED
          <small> (FOR PRIVATE TREAT SALES) [CLAUSE 3]</small>`
          }
      </h3>
  
      <div>
          <strong>
              ${saleProcess === "Auction" ? "RESERVE PRICE" : "PRICE"}:
          </strong>
          <span>
              ${saleProcess === "Auction" ? "To be advised" : "Offers Invited"}
          </span>
      </div>
  </section>
  <section>
      <h3>
          D. LICENSEE’S REMUNERATION <small>[CLAUSE 4]</small>
      </h3>
  
      <div>
          <p>
              <strong>
                  The Licensee’s GST inclusive commission shall be calculated on
                  the GST inclusive selling price in the following way:
              </strong>
              <strong>Commission payable ${commissionFee}%</strong>
          </p>
          <p>
              [e.g. % of sale price/fixed amount/% of sale price plus fixed
              amount/other]
          </p>
  
          <p>
              Should the sale price be more or less than the estimated selling
              price, the commission payable shall be calculated on the sale
              price alone, at the percentage (if any) indicated above.
          </p>
  
          <p>
              If the Property is sold for the Licensees ESTIMATE of:
              <strong>
                  ${startPrice + (endPrice ? " - " + endPrice : "")}
              </strong>
          </p>
  
          <p>
              the GST inclusive remuneration would be:
              <strong> ${commissionRange}</strong>
          </p>
  
          <p>Commission notes:</p>
  
          <p>
              <strong>IMPORTANT: </strong>
              <span>
                  This is an exclusive agency agreement. This means you may have
                  to pay the agent commission even if another agent (or you)
                  sells the property or introduces a buyer who later buys the
                  property.
              </span>
          </p>
          <p>
              <strong>WARNING: </strong>
              <span>
                  Have you signed an agency agreement for the sale of this
                  Property with another agent? If you have, you may have to pay
                  2 commissions (if this agreement or the other agreement you
                  have signed is a sole or exclusive agency agreement).
              </span>
          </p>
      </div>
  </section>
  <section>
      <h3>
          E. EXPENSES AND CHARGES <small>[CLAUSE 5]</small>
      </h3>
  
      <div class="col-12">
          <p>
              Government and other imposts are to be reimbursed as charged.
          </p>
          <p>
              The expenses or charges the Licensee expects to incur in
              connection with services to be provided under the Agency
              Agreement, and for which the Licensee is entitled under the
              Agency Agreement to be reimbursed (including any advertising and
              promotion costs) are as follows:
          </p>
          <p>
              Description of expense or charge, and services it is connected
              with:
          </p>
      </div>
      <div>
          <table>
              <thead class="border-bottom text-start">
                  <tr>
                      <th class="py-1 pr-2">
                          Description of expense of charge, and services it is
                          connected with,
                      </th>
                      <th class="py-1 px-2">
                          Estimated or Actual (GST inclusive) See attached annexure
                      </th>
                      <th class="py-1 pl-2">
                          When reimbursement is expected to be due and payable to
                          the Licensee
                      </th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td class="py-1 pr-2">Total marketing expenses</td>
                      <td class="py-1 px-2 text-start">
                          As per shopping cart
                      </td>
                      <td class="py-1 pl-2 text-center">
                          Upon Invoice
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
  </section>
  <section>
      <h3>
          F. ADVERTISING AND PROMOTION <small>[CLAUSE 6]</small>
      </h3>
      <div>
          <p>
              <strong>Manner of Advertising and Promotion: </strong>
              At Agent discretion upon meeting with Vendor/s.
          </p>
      </div>
  </section>
  <section>
      <h3>
          G. INSPECTION OF PROPERTY <small>[CLAUSE 7]</small>
      </h3>
      <div>
          <p>
              <strong>Manner of Inspection: </strong>
              Accompanied by an Agent.
          </p>
      </div>
  </section>
  <section>
      <h3>
          H. DISCLOSURE OF REBATES, DISCOUNTS, COMMISSIONS OR OTHER BENEFITS
          <small>[CLAUSE 20]</small>
      </h3>
  
      <div>
          <table>
              <thead class="border-bottom text-start">
                  <tr>
                      <th class="py-1 pr-2">Name of source:</th>
                      <th class="py-1 px-2">Description: </th>
                      <th class="py-1 pl-2">
                          Actual or Estimate (to the extent it can reasonably be
                          estimated) (GST inclusive:)
                      </th>
                  </tr>
              </thead>
              <tbody class="text-secondary">
                  <tr>
                      <td class="py-1 pr-2">NIL</td>
                      <td class="py-1 px-2">NIL</td>
                      <td class="py-1 pl-2">NIL</td>
                  </tr>
              </tbody>
          </table>
      </div>
  </section>
  
  <pagebreak />
  
  <div id="editable">
      <section>
          <h3>ADDITIONAL INSTRUCTIONS</h3>
          <div>
              <p>
                  Termination clause: The vendor may terminate this agreement at
                  any time with one (1) days notice
              </p>
          </div>
      </section>
  
      <section>
          <h3>MATERIAL FACT DISCLOSURE</h3>
          <div>
              <p>
                  This disclosure is to be read in conjunction with clause 9 of
                  the Agreement.
              </p>
              <p>
                  In accordance with the requirements pursuant to section 52(1)(b)
                  of the Property and Stock Agents Act 2002 and Regulation 54 of
                  the Property and Stock Agents Regulation 2014, please disclose
                  whether the following material facts are applicable to the
                  property the subject of this agreement.
              </p>
              <p>Don't Know.</p>
              <p>
                  Building product rectification order has the same meaning as in
                  the Building Products (Safety) Act 2017.
              </p>
              <p>
                  External combustible cladding and fire safety order have the
                  same meanings as in the Environmental Planning and Assessment
                  Regulation 2000.
              </p>
          </div>
      </section>
  
      <section>
          <h3>ESTIMATED SELLING PRICE - EVIDENCE</h3>
          <div>
              <p>
                  By signing below the Vendor acknowledges having received the
                  following evidence of the reasonableness of the estimated
                  selling price
              </p>
              <p>
                  <strong>Comparative Market Analysis</strong>
              </p>
              <p>
  
                  The Agent and the Vendor/s acknowledge and confirm that before
                  signing this agreement the Agent and the Vendor/s have read and
                  understood and agree to the terms and conditions in Part 3 of
                  this agreement and the Vendor/s acknowledges being served (by
                  electronic means or otherwise) with a copy of this agreement
                  within 48 hours after this agreement was signed by or on behalf
                  of the Licensee.
              </p>
              <p>
                  The approved guide entitled “Agency Agreements for the sale of
                  Residential Property” was provide to the Vendor within one month
                  of this agreement being signed or on behalf of the Vendor/s
                  (failure to do so is an offence)
              </p>
              <p>Yes</p>
              <p>Date Provided: ${agreementDate ? agreementDate:'' } [Clause 13].</p>
          </div>
      </section>
  
      <section>
          <table class="w-full border-collapse">
              <thead>
                  <tr class="bg-gray-100">
                      <th class="py-2 px-3 text-start">Name</th>
                      <th class="py-2 px-3 text-start">Signature</th>
                      <th class="py-2 px-3 text-start">Date</th>
                  </tr>
              </thead>
              <tbody>
                  ${vendors
                    .map(
                      (vendor) => `
                  <tr class="border-b">
                      <td class="py-2 px-3">${vendor.firstName} ${vendor.lastName}</td>
                      <td class="py-2 px-3"> <img src=${vendor.signature} alt="agent sign" class="w-auto h-8"></img></td>
                      <td class="py-2 px-3">${vendor.signedDate}</td>
                  </tr>
                  `
                    )
                    .join("")}
              </tbody>
          </table>
      </section>
  
      <pagebreak />
  
      <h2>
          PART 3 | TERMS AND CONDITIONS OF EXCLUSIVE
          ${saleProcess === "Auction" ? "AUCTION" : "SELLING"} AGENCY AGREEMENT
          AND CONTINUING AGENCY AGREEMENT
      </h2>
  
      <div class="terms">
          <ol type="1">
              <li>
                  DEFINITIONS
                  <ol>
                      <li>
                          "the Act" means the Property and Stock Agents Act 2002
                          (NSW).
                      </li>
                      <li>
                          "the ETA" means the Electronic Transactions Act 2000 (NSW).
                      </li>
                      <li>
                          "Agreement" means this Sales Inspection Report and Exclusive
                          ${
                            saleProcess === "Auction" ? "Auction" : "Selling"
                          } Agency
                          Agreement and Continuing Agency Agreement, including the
                          terms and conditions set out in this Part 3.
                      </li>
                      <li>
                          "Government and other imposts" includes State and Federal
                          Taxes and any tax in the nature of a goods or services tax
                          and any other taxes or charges debited by banks or financial
                          institutions against the account of the Licensee in relation
                          to sale of the Property.
                      </li>
                      <li>
                          "Introduced" – A Purchaser shall be taken to have been
                          "Introduced" to the Property or the Vendor by the Licensee,
                          by any other agent, or by any other person (including the
                          Vendor):
                          <ol type="a">
                              <li>
                                  if the Purchaser becomes aware that the Property is
                                  available for sale as a result of reading any
                                  advertisement, notice or placard referring to the
                                  availability of the Property for sale, published or
                                  erected by, or in the name of, the Licensee or that
                                  other agent or that other person (including the Vendor);
                                  or
                              </li>
                              <li>
                                  if the fact that the Property is available for sale is
                                  otherwise made known to the Purchaser by or through the
                                  Licensee or that other agent or that other person
                                  (including the Vendor); or
                              </li>
                              <li>
                                  if the Licensee or that other agent or that other person
                                  (including the Vendor) is an effective cause of the
                                  Sale, whether or not the Sale agreement is entered into
                                  whilst this Agreement is on foot; and
                              </li>
                              <li>
                                  regardless of the fact that more than one person could
                                  be said to have Introduced the Purchaser to the Property
                                  or the Vendor, within the meaning of this clause; and
                              </li>
                              <li>
                                  regardless of whether the Purchaser is merely related to
                                  or known by the person who had the actual relevant
                                  dealings with the Licensee or that other agent or that
                                  other person (including the Vendor); and
                              </li>
                              <li>
                                  regardless of when the Purchaser came into existence or
                                  acquired legal personality or capacity.
                              </li>
                          </ol>
                      </li>
                      <li>
                          "Material Fact" is a fact that would be important to a
                          reasonable person in deciding whether or not to proceed with
                          a particular transaction or a matter prescribed by the Act
                          or clause 54 Property and Stock Agents Regulation.
                      </li>
                      <li>
                          "Person" includes a corporation or representative of a
                          corporation.
                      </li>
                      <li>
                          "Purchaser" includes a person who enters into a binding
                          agreement to purchase the Property (which includes the
                          exercising of an option, or entering into any agreement that
                          is in effect, if not by name or strict legal construction, a
                          purchase of the Property), whether or not it completes.
                      </li>
                      <li>
                          "Sale" includes a binding agreement to purchase the Property
                          (which includes the exercising of an option, or entering
                          into any agreement that is in effect, if not by name or
                          strict legal construction, a purchase of the Property),
                          whether or not it completes.
                      </li>
                      <li>
                          Words importing one gender include the other and singular
                          includes the plural and vice versa (e.g. “Vendor”, if
                          applicable, refers to the vendors, when two or more people
                          own the Property).
                      </li>
                      <li>
                          A reference to includes means includes but without
                          limitation.
                      </li>
                  </ol>
              </li>
              <li>
                  AGENCY
                  <ol>
                      <li>
                          The Vendor appoints the Licensee to sell the Property on
                          behalf of the Vendor as:
                          <ol type="a">
                              <li>
                                  exclusive selling agent for the sale of the Property,
                                  for the Exclusive Agency Period set out in Part 2, Item
                                  A; and (b)at the expiry of the Exclusive Agency Period,
                                  as non-exclusive selling agent for the sale of the
                                  Property for the <br />
                                  <span class="ml-1">
                                      Continuing Agency Period set out in Part 2, Item A.
                                  </span>
                              </li>
                          </ol>
                      </li>
                  </ol>
              </li>
              <li>
                  ${saleProcess === "Auction" ? "RESERVE PRICE" : "PRICE"}
                  <ol>
                      ${
                        saleProcess === "Auction"
                          ? `
                      <li>
                          If the method of sale specified in Item B of the
                          Particulars is “Auction”, the Vendor authorises the
                          Licensee to:
                          <br />
                          (a) submit the Property for sale by public auction on a
                          date agreed with the Vendor, and to appoint an
                          auctioneer as the Vendor’s auctioneer; and <br />
                          (b) sell the Property at or above the reserve price
                          stated in Item C of the Particulars, or such other
                          reserve price that the Vendor approves.
                      </li>
                      <li>
                          If no reserve price is stated in Item C of the
                          Particulars, the Vendor must give the reserve price to
                          the auctioneer in writing prior to the commencement of
                          the auction (and by doing so is taken to have given
                          their approval for the purposes of clause 3.1(b)).
                      </li>
                      <li>
                          The Vendor may at any time authorise the Licensee to
                          sell the Property by private treaty
                      </li>
                      `
                          : `
                      <li>
                          If the Property is sold by private treaty, the Vendor
                          authorises the Licensee to sell the Property at the price
                          set out in Item C of the Particulars or such other price
                          the Vendor approves.
                      </li>`
                      }
                  </ol>
              </li>
              <li>
                  LICENSEE’S REMUNERATION
                  <ol>
                      <li>
                          Remuneration - The Licensee is entitled to the Remuneration
                          set out in Item D of the Particulars ("the Remuneration") as
                          follows:-
                          <ol type="a">
                              <li>
                                  The Licensee will be entitled to the Commission set out
                                  in Item D of the Particulars ("the Commission") if,
                                  during the Exclusive Agency Period:
                                  <ol type="i">
                                      <li>
                                          the Purchaser is Introduced to the Property or the
                                          Vendor by the Licensee, by any other agent, or by
                                          any other person (including the Vendor), whether or
                                          not a Sale of the Property occurs whilst this
                                          Agreement is on foot; or
                                      </li>
                                      <li>
                                          there is a Sale of the Property, even if the Sale
                                          does not complete (and regardless of the cause of
                                          the Sale not completing).
                                      </li>
                                  </ol>
                              </li>
                              <li>
                                  The Licensee will be entitled to the Commission if,
                                  during the Continuing Agency Period:
                                  <ol type="i">
                                      <li>
                                          the Purchaser is Introduced to the Property or the
                                          Vendor by the Licensee, by an agent who is not
                                          lawfully appointed pursuant to the Act, or by any
                                          other person (including the Vendor), whether or not
                                          a Sale of the Property occurs whilst this Agreement
                                          is on foot; or
                                      </li>
                                      <li>
                                          there is a Sale of the Property other than a Sale
                                          resulting from the Purchaser being Introduced to the
                                          Property or the Vendor during the Continuing Agency
                                          Period by another agent lawfully appointed pursuant
                                          to the Act, even if the Sale does not complete (and
                                          regardless of the cause of the Sale not completing).
                                      </li>
                                  </ol>
                              </li>
                              <li>
                                  The Commission is due and payable by the Vendor to the
                                  Licensee immediately and in full when the Sale of the
                                  Property completes.
                              </li>
                              <li>
                                  If, after the Vendor and the Purchaser have entered into
                                  a binding agreement for the Sale of the Property:
                                  <ol type="i">
                                      <li>
                                          the Vendor and the Purchaser enter into a mutual
                                          agreement (whether written or verbal) to rescind the
                                          agreement or otherwise not proceed with the Sale; or
                                      </li>
                                      <li>
                                          the agreement is terminated as a result of the
                                          default of the Vendor; or
                                      </li>
                                      <li>
                                          the agreement is terminated as a result of the
                                          default of the Purchaser (regardless of the amount
                                          of the deposit which has been paid at the date of
                                          termination, and regardless of the amount of the
                                          deposit which is forfeited to or recoverable by the
                                          Vendor); or
                                      </li>
                                      <li>
                                          the Vendor does not proceed with the Sale for any
                                          other reason (including a postponement of the
                                          completion of the Sale for more than 30 days after
                                          the original completion date),
                                          <br />
                                          <span class="ml-2">
                                              the Commission will become due and payable by the
                                              Vendor to the Licensee immediately.
                                          </span>
                                      </li>
                                  </ol>
                              </li>
                              <li>
                                  The Commission is calculated (as set out in Item D of
                                  the Particulars) on the selling price, and is inclusive
                                  of GST.
                                  <p class="ml-2">
                                      WARNING: The term immediately above provides that a
                                      commission is payable under this agreement even if the
                                      sale of the property is not completed.
                                  </p>
                                  <p class="ml-2">
                                      IMPORTANT: This is an exclusive agency agreement. This
                                      means you may have to pay the agent commission even if
                                      another agent (or you) sells the property or
                                      introduces a buyer who later buys the property.
                                  </p>
                                  <p class="ml-2">
                                      WARNING: Have you signed an agency agreement for the
                                      sale of this Property with another agent? If you have
                                      you may have to pay 2 commissions (if this agreement
                                      or the other agreement you have signed is a sole or
                                      exclusive agency agreement).
                                  </p>
                              </li>
                          </ol>
                      </li>
                      <li>
                          Authority to Deduct – The Licensee may, upon receipt of a
                          direction from the Purchaser or their Legal Representative
                          authorising the Licensee to account to the Vendor for the
                          deposit, deduct from the deposit all or part of the
                          Remuneration, and all or part of the Expenses and Charges
                          that are payable to the Licensee pursuant to this Agreement,
                          up to the entire amount of the deposit.
                      </li>
                      <li>
                          Variation - The Remuneration provided for in this Agreement
                          (that is, both the Commission and the Other Services) cannot
                          be varied except as agreed in writing by the Vendor.
                      </li>
                  </ol>
              </li>
              <li>
                  EXPENSES AND CHARGES
                  <ol>
                      <li>
                          The Vendor must reimburse the Licensee for the expenses and
                          charges incurred and described in Item E of the Particulars.
                          Those services and amounts cannot be varied except with the
                          agreement in writing of the Vendor.
                      </li>
                      <li>
                          The reimbursement is due and payable as and when the Vendor
                          is notified by the Licensee that the expenses or charges
                          have been incurred.
                      </li>
                      <li>
                          The actual amount incurred is to be reimbursed (including
                          any additional GST which the Licensee is or becomes liable
                          to pay to the Commonwealth), even if it exceeds the estimate
                          (if any) that is given in Item E.
                      </li>
                      <li>
                          Variation - The Expenses and Charges provided for in this
                          Agreement cannot be varied except as agreed in writing by
                          the Vendor.
                      </li>
                  </ol>
              </li>
              <li>
                  ADVERTISING AND PROMOTION
                  <ol>
                      <li>
                          The Licensee will advertise or otherwise promote the
                          Property as set out in Item F of the Particulars.
                      </li>
                      <li>
                          If the Licensee is to pay any advertising or promotion
                          costs, they are to be included in Item E as “Expenses and
                          Charges”.
                      </li>
                      <li>
                          The Licensee is authorised to erect a For Sale sign at the
                          Property unless instructed differently.
                      </li>
                      <li>
                          The Vendor acknowledges that the Licensee is not responsible
                          for any liability, injury or damage incurred as a result of
                          the sign being erected at the Property.
                      </li>
                  </ol>
              </li>
              <li>
                  CONJUNCTION AGENTS
                  <ol>
                      <li>
                          The Vendor acknowledges that the Licensee is authorised to
                          act in conjunction with another licensed real estate agent
                          to market and sell the Property, however the Licensee is not
                          authorised to offer any payment to the conjunction agent
                          other than a payment that is made by, or from monies owing
                          to, the Licensee.
                      </li>
                      <li>
                          For the avoidance of doubt, and notwithstanding any other
                          provision in this Agreement:
                          <ol>
                              <li>
                                  the Licensee is forbidden to pay any conjunction fee or
                                  any other payment in the nature of a referral fee to a
                                  person who is not appropriately licensed under the Act
                                  or under any other legislation applicable to them;
                              </li>
                              <li>
                                  the use of a conjunction agent does not increase the
                                  amount of, or vary in any way, the Remuneration or the
                                  Expenses and Charges, unless expressly agreed in
                                  writing; and
                              </li>
                              <li>
                                  if during the Continuing Agency Period, a Sale of the
                                  Property results from the Licensee acting as a
                                  conjunction agent (as opposed to the Licensee using a
                                  conjunction agent), the Licensee is not entitled to be
                                  paid any of the Commission, but is permitted to accept
                                  payment from monies that are held by or owing to that
                                  other licensed agent.
                              </li>
                          </ol>
                      </li>
                  </ol>
              </li>
              <li>
                  MATERIAL FACTS
                  <ol>
                      <li>
                          The Vendor acknowledges that pursuant to the Act and clause
                          54 Property and Stock Agents Regulation, the Licensee is
                          required to disclose all “Material Facts” relating to the
                          Property to any prospective or actual purchaser.
                      </li>
                      <li>
                          The Vendor warrants that they have provided to the Licensee
                          all information which may be considered a “Material Fact” in
                          relation to the Property and they have completed the
                          Material Fact disclosure document which forms part of this
                          Agreement.
                      </li>
                      <li>
                          The Vendor warrants that if they become aware of any further
                          information that may be considered a Material Fact after
                          entering into this Agreement they will immediately provide
                          that information to the Licensee.
                      </li>
                      <li>
                          The Vendor authorises and directs the Licensee to disclose
                          anything which may be a “Material Fact” in relation to the
                          Property to any actual or prospective purchaser of the
                          Property.
                      </li>
                      <li>
                          The Vendor indemnifies the Licensee against all actions,
                          claims and demands brought against, and all costs, losses
                          and liabilities incurred by the Licensee arising from or
                          connected with a failure on the part of the Vendor to
                          disclose a “Material Fact” or as a result, howsoever caused,
                          of the Vendor providing false, misleading or deceptive
                          information to the Licensee.
                      </li>
                  </ol>
              </li>
              <li>
                  DEPOSIT
                  <ol>
                      <li>
                          The Vendor agrees that any deposit paid in accordance with
                          an agreement for the sale of the Property will be held in
                          the Trust Account of the Licensee as stakeholder, as
                          directed by the parties, pending completion of the sale.
                      </li>
                  </ol>
              </li>
              <li>
                  FINANCIAL INSTITUTION TAXES OR DEDUCTIONS
                  <ol>
                      <li>
                          If the Licensee incurs any taxes or deductions debited by
                          banks or other financial institutions against the Licensee’s
                          account, that relate to the affairs of the Vendor, the
                          Licensee is entitled to be reimbursed for the charges it
                          incurs.
                      </li>
                  </ol>
              </li>
              <li>
                  PAYMENT TO THE VENDOR
                  <ol>
                      <li>
                          If any money that is held by the Licensee in respect of this
                          Agreement becomes due and payable to the Vendor, the Vendor
                          directs the Licensee to pay the money by cheque or
                          electronic funds transfer to the Vendor's bank account.
                      </li>
                  </ol>
              </li>
              <li>
                  APPROVED GUIDE
                  <ol>
                      <li>
                          The Vendor confirms that prior to (but no more than 1 month
                          prior to) the Vendor signing this Agreement, the Licensee
                          has provided the Vendor with a copy of the approved guide
                          entitled ‘Agency Agreements for the Sale of Residential
                          Property’.
                      </li>
                  </ol>
              </li>
              <li>
                  CONTRACT FOR SALE
                  <ol>
                      <li>
                          The Licensee must not offer the Property (if the Property is
                          a residential property), for sale unless a copy of the
                          proposed contract for the sale of the Property (including
                          all mandatory disclosure documents required by section 52A
                          of the Conveyancing Act 1919) is available for inspection by
                          prospective purchasers at the Licensee’s registered office.
                      </li>
                      <li>
                          The Vendor must provide to the Licensee a copy of the
                          contract for sale as soon as it is practicable.
                      </li>
                      <li>
                          The Licensee is not authorised to sign a contract for sale
                          on behalf of the Vendor.
                      </li>
                  </ol>
              </li>
              <li>
                  INDEMNITY
                  <ol>
                      <li>
                          The Agent having complied with its obligations under this
                          Agreement and not having been negligent, the Vendor
                          indemnifies the Agent, its officers and employees, from and
                          against all actions, claims, demands, losses, costs damages
                          and expenses arising out of this Agreement in respect of:
                          <br />
                          <ol type="i">
                              <li> authorised sales advertising and signage; or</li>
                              <li>
  
                                  the Vendor's failure to comply with this Agreement; or
                              </li>
                              <li>
  
                                  the Vendor's failure to give the Agent prompt and
                                  appropriate authority or instruction, or sufficient
                                  funds to carry out an instruction or authority; or
                              </li>
                              <li>
  
                                  the Agent acting on behalf of the Vendor under this
                                  Agreement; or
                              </li>
                              <li>
  
                                  the Agent incurring legal costs of employing the
                                  services of a credit collection agency to recover unpaid
                                  debts; or
                              </li>
                              <li>
  
                                  any claim for compensation in respect of damage or loss
                                  to the Vendor's goods; or
                              </li>
                              <li>
  
                                  a warning label or safety instructions having been
                                  removed, damaged or defaced where a product or fitting
                                  has been supplied to the Property with such a label or
                                  instruction attached.
                              </li>
                          </ol>
                      </li>
                  </ol>
              </li>
              <li>
                  WARRANTY BY THE VENDOR
                  <ol>
                      <li>
                          The Vendor warrants to the Licensee that the Vendor has any
                          necessary authority to enter into this Agreement with the
                          Licensee.
                      </li>
                  </ol>
              </li>
              <li>
                  GST
                  <ol>
                      <li>
                          In this clause, GST Law has the meaning given in the A New
                          Tax System (Goods and Services Tax) Act 1999 (Cth), and
                          terms used which are not defined in this Agreement but which
                          are defined in the GST Law, have the meanings given in the
                          GST Law.
                      </li>
                      <li>
                          Unless stated otherwise, all consideration provided under or
                          referred to in this Agreement is stated as an amount that is
                          inclusive of GST, at the rate of 10%. If the rate of GST is
                          increased or decreased, the Vendor and the Licensee agree
                          that these GST inclusive amounts will be varied to reflect
                          that increase or decrease. The time of supply for the
                          purposes of the GST Law is the time when the consideration
                          is payable pursuant to this Agreement.
                      </li>
                      <li>
                          The Vendor must pay to the Licensee any GST payable in
                          respect of any taxable supply made by the Licensee to the
                          Vendor. Upon request by the Vendor, the Licensee will
                          provide a tax invoice in respect of any such taxable supply.
                      </li>
                  </ol>
              </li>
              <li>
                  PRIVACY NOTICE
                  <ol>
                      <li>
                          The Privacy Act 1988 (Cth) regulates the collection, use,
                          storage and disclosure of personal information of the Vendor
                          by the Licensee.
                      </li>
                      <li>
                          The information is collected by and pursuant to this
                          Agreement.
                      </li>
                      <li>
                          The information collected enables the Licensee to act for
                          and on behalf of the Vendor and to carry out effectively the
                          Licensee’s obligations under and pursuant to the terms of
                          this Agreement and to perform and promote the real estate
                          agency services of the Licensee. Some of the information is
                          required by law and without it the Licensee may not be able
                          to act for and on behalf of the Vendor.
                      </li>
                      <li>
                          The intended recipients of the information are any person to
                          whom, and any body or agency to which, it is usual to
                          disclose the information to enable the Licensee to perform
                          the services under or pursuant to this Agreement, real
                          estate agency services, or to otherwise act as permitted by
                          the Privacy Act 1988, including potential tenants, actual or
                          potential landlords, contractors (tradespeople), print and
                          electronic media, internet, State or Federal authorities, or
                          organisations (as well as owners’ corporations and community
                          associations).
                      </li>
                      <li>
                          The Vendor has the right to access the information and may
                          do so by contacting the Licensee. The Vendor has the right
                          to require correction of the information if it is not
                          accurate, up-to-date and complete.
                      </li>
                  </ol>
              </li>
              <li>
                  FINANCIAL AND INVESTMENT ADVICE
                  <ol>
                      <li>
                          WARNING: Any financial or investment advice provided to the
                          Vendor by the Licensee is general advice and does not take
                          into account the individual circumstances of the Vendor or
                          the Vendor’s objectives, financial situation or needs. The
                          Vendor must seek and rely on their own independent financial
                          and investment advice from an appropriately licensed
                          financial adviser.
                      </li>
                  </ol>
              </li>
              <li>
                  REBATES, DISCOUNTS, COMMISSIONS AND OTHER BENEFITS
                  <ol>
                      <li>
                          The Licensee has made a reasonable attempt to set out in
                          Item H of the Particulars any rebates, discounts,
                          commissions, or other benefits that the Licensee will or may
                          receive in respect of the expenses charged under this
                          Agreement, and the estimated amount of those rebates,
                          discounts, commissions, or other benefits (to the extent
                          that the amount can reasonably be estimated). The Vendor
                          agrees that the Licensee is entitled to retain all such
                          rebates, discounts, commissions, or other benefits.
                      </li>
                  </ol>
              </li>
              <li>
                  LIMIT OF LICENSEE’S SERVICES
                  <ol>
                      <li>
                          The Licensee will not undertake any other services in
                          connection with the sale of the Property, other than the
                          services listed in this Agreement.
                      </li>
                  </ol>
              </li>
              <li>
                  CONSTRUCTION OF THIS AGREEMENT, INCLUDING ADDITIONAL CLAUSES
                  <ol>
                      <li>
                          If a provision of this Agreement (including any amendments
                          to it, or any additional clauses or special conditions
                          inserted in it) is illegal or unenforceable (including as a
                          result of being found either to be uncertain, or to give
                          rise to uncertainty when read in conjunction with the
                          original text of this Agreement, or to not give rise to a
                          legally binding agreement), that provision may be severed
                          and the remainder of this Agreement will continue in force.
                      </li>
                  </ol>
              </li>
              <li>
                  ELECTRONIC SIGNATURES
                  <ol>
                      <li>
                          The Licensee and the Vendor agree that, by typing or
                          entering the text of their names where and when requested to
                          do so:
                          <ol type="a">
                              <li>
                                  they are acknowledging and warranting that by doing so,
                                  they are identifying themselves to each other (including
                                  identifying themselves, as applicable, as either offeror
                                  or offeree), for the purposes of the ETA or any other
                                  applicable law;
                              </li>
                              <li>
                                  they will have signed this Agreement or affixed their
                                  signature to it, for the purposes of the ETA or any
                                  other applicable law that requires this Agreement to be
                                  signed by the Licensee or the Vendor;
                              </li>
                              <li>
                                  this Agreement will thereby contain their electronic
                                  signature, for the purposes of the ETA or any other
                                  applicable law; (d)they will be expressing and
                                  confirming their immediate intention to be legally bound
                                  by this Agreement, which they acknowledge contains all
                                  of the terms of the agreement between them, and is the
                                  finalised form of the agreement between them;
                              </li>
                              <li>
                                  they are consenting to each other identifying
                                  themselves, signing this Agreement, and expressing their
                                  intentions as referred to in this clause, in this way;
                              </li>
                              <li>
                                  they are agreeing that this Agreement is in writing,
                                  that this Agreement has been signed by them, that their
                                  signature and other information contained in this
                                  Agreement has been given or provided in writing, and
                                  that nothing in the electronic format of this Agreement
                                  (including the method of signing it) affects the legally
                                  binding and enforceable nature of this Agreement; and
                              </li>
                              <li>
                                  they will be representing the matters in the previous
                                  sub-clause to one another, and in turn will be acting in
                                  reliance on each other’s representations to that same
                                  effect.
                              </li>
                          </ol>
                      </li>
                  </ol>
              </li>
          </ol>
      </div>
  </div>
  
  <br>
  <div class="page-break"></div>
  <div>
      <h3 class="text-center">SOLD MATCHES</h3>
      ${
        recommendedSold.length > 0
          ? `
      <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse">
              <thead>
                  <tr class="bg-gray-100">
                      <th class="py-2 px-3 text-start">Address</th>
                      <th class="py-2 px-3 text-start">Price</th>
                      <th class="py-2 px-3 text-start">Score Match</th>
                  </tr>
              </thead>
              <tbody>
                  ${recommendedSold
                    .map(
                      (item) => `
                  <tr class="border-b">
                      <td class="py-2 px-3">${item.address}</td>
                      <td class="py-2 px-3">${formatCurrency(item.price)}</td>
                      <td class="py-2 px-3">${item.score}%</td>
                  </tr>
                  `
                    )
                    .join("")}
              </tbody>
          </table>
      </div>
      `
          : ""
      }
  </div>
  
  <br>
  
  <div>
      <h3 class="text-center">SALE MATCHES</h3>
      ${
        recommendedSales.length > 0
          ? `
      <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse">
              <thead>
                  <tr class="bg-gray-100">
                      <th class="py-2 px-3 text-start">Address</th>
                      <th class="py-2 px-3 text-start">Price</th>
                      <th class="py-2 px-3 text-start">Score Match</th>
                  </tr>
              </thead>
              <tbody>
                  ${recommendedSales
                    .map(
                      (item) => `
                  <tr class="border-b">
                      <td class="py-2 px-3">${item.address}</td>
                      <td class="py-2 px-3">${formatCurrency(item.price)}</td>
                      <td class="py-2 px-3">${item.score}%</td>
                  </tr>
                  `
                    )
                    .join("")}
              </tbody>
          </table>
      </div>
      `
          : ""
      }
  </div>
  
  <br>
  <div class="page-break"></div>
  <div>
      <h3 class="text-center">MARKETING</h3>
      <table class="w-full border">
          <tbody>
              ${marketing?.marketingItems
                ?.map(
                  (item) => `
              <tr key={index} class="border-b">
                  <td class="px-4 py-2">${item.name}</td>
                  <td class="px-4 py-2"></td>
              </tr>`
                )
                .join("")}
  
              <tr>
                  <td class="border px-4 py-2 font-bold">TOTAL</td>
                  <td class=" px-4 py-2 flex items-center">
                      ${marketing.marketingPrice}
                  </td>
              </tr>
          </tbody>
      </table>
  </div>`;

    const styledAgreementContent = `
  <!DOCTYPE html>
  <html>
  <head>
      <script src="https://cdn.tailwindcss.com"></script>
  <style>
 .page-break {
  page-break-before: always; /* For print context */
  break-before: page;        /* Modern browser support */
}
  
  .terms-condition {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px !important;
    line-height: 1.6;
    /* padding: 60px; */
    padding: 8px;
  }
  
  /* ----------------------------------- *
  *   Typography
  * ----------------------------------- */
  .terms-condition h1 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 700 !important;
    margin: 1rem 0rem;
  }
  
  .terms-condition h2 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    font-weight: 700 !important;
    margin: 0.5rem 0rem;
  }
  
  .terms-condition h3 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    line-height: 1.6;
    font-weight: 700 !important;
    margin: 0.3rem 0rem;
  }
  
  .terms-condition h4 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    line-height: 1.6;
    font-weight: 700 !important;
    margin: 0.2rem 0rem;
  }
  
  .terms-condition h5 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    color: #666666;
  }
  
  .terms-condition p {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    margin-bottom: 0.5rem;
  }
  
  .terms-condition span {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }
  
  .terms-condition strong {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }
  
  .terms-condition ol {
    font-family: Arial, Helvetica, sans-serif;
    padding-left: 0.5rem;
    position: relative;
    margin-top: 0.3rem;
    font-size: 10px;
  }
  
  td, th, tr {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }
  
  .terms-condition ol[type="a"] {
    list-style-type: lower-alpha;
  }
  
  .terms-condition ol[type="i"] {
    list-style-type: lower-roman; /* Ensure Roman numerals are used */
  }
  
  .terms-condition ol li {
    font-family: Arial, Helvetica, sans-serif;
    margin-bottom: 0.3rem;
    font-size: 10px;
  }
  
  .terms > ol {
    font-family: Arial, Helvetica, sans-serif;
    padding-left: 0rem;
    margin-left: 0rem;
    counter-reset: item;
  }
  
  .terms > ol > li {
    font-family: Arial, Helvetica, sans-serif;
    display: block;
  }
  
  .terms > ol > li:before {
    font-family: Arial, Helvetica, sans-serif;
    content: counters(item, ". ") ". ";
    counter-increment: item;
  }
  
  .terms > ol > li > ol {
    font-family: Arial, Helvetica, sans-serif;
    counter-reset: item;
    padding-left: 0.5rem;
    margin-left: 0rem;
  }
  
  .terms > ol > li > ol > li {
    font-family: Arial, Helvetica, sans-serif;
    display: block;
    padding-left: 0.5rem;
    margin-left: 0rem;
  }
  
  .terms > ol > li > ol > li:before {
    font-family: Arial, Helvetica, sans-serif;
    content: counters(item, ". ") ". ";
    counter-increment: item;
  }
  
  .terms-condition small {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    color: #9f9f9f;
    font-weight: normal;
  }
  </style>
  </head>
  <body>
  <div class="terms-condition">
    ${agreementContent}
  </div>
  </body>
  </html>
  `;

    // this script for production
    const launchOptions = {
      headless: true, // Run in headless mode
      ignoreDefaultArgs: ["--disable-extensions"],
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
      dumpio: false,
      timeout: 120000,
    };

    // Add executablePath only if environment is PROD
    if (process.env.ENVIRONMENT === "PROD") {
      launchOptions.executablePath = "/usr/bin/google-chrome-stable";

      // launchOptions.executablePath = "/usr/bin/chromium-browser"; // Path to the installed Chromium on Ubuntu
    }

    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(styledAgreementContent, {
      waitUntil: "networkidle0",
    });

    // Define footer with page number
    const footerTemplate = `
      <div style="width: 100%; font-size: 8px; font-family: Arial, Helvetica, sans-serif; text-align: center; color: #333; padding: 5px 10px;">
        <div style="width: 100%; padding-top: 5px; font-weight: 700;">
          <span style="text-align:center; font-size: 10px; letter-spacing: 2px;margin-left:16px;">AUSREALTY</span>
          <span style="float: right; font-size: 10px;margin-right:16px;">Page <span class="pageNumber"></span></span>
        </div>
      </div>`;

    //   const pdfBuffer = await page.pdf({ format: 'A4' });
    const generatedPdfBuffer = await page.pdf({
      path: "agreement.pdf",
      format: "A4",
      margin: {
        top: "20mm",
        right: "10mm",
        bottom: "20mm",
        left: "10mm",
      },
      displayHeaderFooter: true,
      footerTemplate: footerTemplate,
      headerTemplate: `<div style="display: none;"></div>`,
      printBackground: true,
    });

    await browser.close();

    // Step 1: Fetch external PDF
    const externalPdfUrl =
      "https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/files/FTR32_Agency_agreement.pdf";
    const externalPdfResponse = await axios.get(externalPdfUrl, {
      responseType: "arraybuffer",
    });
    const externalPdfBytes = externalPdfResponse.data;

    const certificatePdfBytes = await generateCertificate(
      agent,
      content,
      propertyId
    );

    // Step 2: Load both PDFs
    const pdfDoc = await PDFDocument.load(generatedPdfBuffer);
    const externalPdfDoc = await PDFDocument.load(externalPdfBytes);
    const certificatePdfDoc = await PDFDocument.load(certificatePdfBytes);

    // Step 3: Copy pages from external PDF to generated PDF
    const externalPages = await pdfDoc.copyPages(
      externalPdfDoc,
      externalPdfDoc.getPageIndices()
    );
    externalPages.forEach((page) => pdfDoc.addPage(page));

    const certificatePages = await pdfDoc.copyPages(
      certificatePdfDoc,
      certificatePdfDoc.getPageIndices()
    );
    certificatePages.forEach((page) => pdfDoc.addPage(page));

    // Step 4: Final merged PDF
    const mergedPdfBytes = await pdfDoc.save();

    // Generate a unique key for the S3 object
    const s3Key = `agreements/${propertyId}-agreement.pdf`;

    // Generate a presigned URL for uploading
    const presignedUrl = await s3.getSignedUrlPromise("putObject", {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: "application/pdf",
      Expires: 600, // URL expires in 600 seconds (10 minutes)
    });

    // Upload the PDF to S3 using the presigned URL
    await axios.put(presignedUrl, mergedPdfBytes, {
      headers: { "Content-Type": "application/pdf" },
    });

    return s3Key;

    // // Set the response headers and send the merged PDF as a response
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader(
    //   "Content-Disposition",
    //   "inline; filename=merged-agency-agreement.pdf"
    // );
    // res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const generateCertificate = async (agent, content, propertyId) => {
  try {
    const {
      name,
      email,
      mobile,
      company,
      companyAddress,
      licenseNumber,
      gst,
      abn,
    } = agent;
    const {
      vendors,
      solicitor,
      status,
      terms,
      saleProcess,
      startPrice,
      endPrice,
      commissionFee,
      commissionRange,
      marketing,
      propertyAddress,
      recommendedSold,
      recommendedSales,
      agentSignature,
    } = content;

    const htmlContent = `
    <h1>A U S R E A L T Y</h1>
    <p class="note">
      Electronic Record and Signature generated on: ${formatDate(new Date(), {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })} <br>
      Parties agreed to: ${name}
    </p>
    <table>
      <tr>
        <td colspan="2" class="heading">Certificate of Completion</td>
      </tr>
      <tr>
        <td class="title">Document ID:#${propertyId}</td>
        <td class="right">Status: Completed</td>
      </tr>
      <tr>
        <td class="title">Agent</td>
        <td class="right">
          ${name} | ${email}
        </td>
      </tr>
      <tr>
        <td class="heading">Signer</td>
        <td class="right heading">Signature</td>
      </tr>
      ${vendors
        .map(
          (vendor) => `
        <tr>
          <td class="signer">
            <strong>${vendor.firstName} ${vendor.lastName}</strong>
            <br> Sent on: ${vendor.sentDate}
            <br> Signed on: ${vendor.signedDate}
            <br> Viewed on: ${vendor.viewedDate}
          </td>
          <td class="signature">
            <img src="${vendor.signature}" class="signature-img h-8">
          </td>
        </tr>
      `
        )
        .join("")}
      <tr>
        <td class="heading" colspan="2">Proof of Identity</td>
      </tr>
           ${vendors
             .map((vendor) => {
               return `
              <tr>
                <td>
                  <p>
                    I ${vendor.firstName} ${vendor.lastName} confirm I am ${vendor.firstName} ${vendor.lastName} as identified by documents provided and/or sighted by Ausrealty. This signature is my own and I also confirm I agree to this electronic signing format.
                  </p>
                </td>
              </tr>
            `;
             })
             .join("")}
    </table>

    <table class="legal">
      <tr>
        <td class="heading">SIGNATURE DISCLOSURE</td>
      </tr>
      ${vendors
        .map((vendor) => {
          return `
              <tr>
                <td>
                  <p>
                    I confirm I am ${vendor.firstName} ${vendor.lastName} as identified by documents provided to Ausrealty. This signature is my own and I also confirm I agree to this electronic signing format.
                  </p>
                </td>
              </tr>
            `;
        })
        .join("")}
    </table>`;

    const styledhtmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://cdn.tailwindcss.com"></script>
    <style>
           body{
            font-family: Arial, sans-serif!important;
            margin:0;
            padding:0;
            font-size:10px
         }
         table{width:100%; border-spacing: 0;
    border-collapse: separate;}
         td {padding:2px}
         h1 {font-size:14pt;font-weight:700;text-align:right;margin-top:-30px}
         .right{text-align:right}
         .heading{background-color:#ccc;padding:4px}
         .note{font-size:8px!important}
         .signer{padding-bottom:10px}
         h2 {font-size:12px}
         .legal p{font-size:10px}
  .signature {
    text-align: right;
    vertical-align: top;
  }
  .signature-img {
    width: auto;
    height: 32px;
    display: inline-block;
  }

    </style>
    </head>
    <body>
    <div>
      ${htmlContent}
    </div>
    </body>
    </html>
    `;

    // this script for production
    const launchOptions = {
      headless: true, // Run in headless mode
      ignoreDefaultArgs: ["--disable-extensions"],
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
      dumpio: false,
      timeout: 120000,
    };

    // Add executablePath only if environment is PROD
    if (process.env.ENVIRONMENT === "PROD") {
      launchOptions.executablePath = "/usr/bin/google-chrome-stable";

      // launchOptions.executablePath = "/usr/bin/chromium-browser"; // Path to the installed Chromium on Ubuntu
    }

    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(styledhtmlContent, { waitUntil: "networkidle0" });

    const generatedPdfBuffer = await page.pdf({
      path: "agreement.pdf",
      format: "A4",
      margin: {
        top: "20mm",
        right: "10mm",
        bottom: "20mm",
        left: "10mm",
      },
      printBackground: true,
    });

    await browser.close();

    return generatedPdfBuffer;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const generateProof = async (agent, content, propertyId) => {
  try {
    const { name } = agent;
    const { vendors, propertyAddress, fraudPrevention, agentSignature } =
      content;

    const proofContent = `<section>

    <h2>PROOF OF ID CHECKLIST</h2>
    <br>

    <h3>VENDOR</h3>
    ${vendors
      .map(
        (vendor) => `
        <div><strong>NAME:</strong> ${vendor.firstName} ${vendor.lastName}</div>
    `
      )
      .join("")}
    <br>

    <div>
    <strong>PROPERTY ADDRESS:</strong> ${propertyAddress}
    </div>

    <br>
    
    <div>
        <strong>
            Declaration:
        </strong>
        <span>I have sighted and confirmed the proof of identity documents provided by the vendor (or appointed
            representative). </span>
    </div>
    <br>
    <div>
        <p>The documents sighted are: ID, Credit Card, Water Rates and Council Rates. </p>
    </div>


    <div>
        <p>${name}</p>
        <img src=${agentSignature} alt="agent sign" class="w-auto h-8"></img>
        <p>${formatDateToAEDT(null)}</p>
    </div>
</section>`;

    const styledAgreementContent = `
  <!DOCTYPE html>
  <html>
  <head>
      <script src="https://cdn.tailwindcss.com"></script>
  <style>
 .page-break {
  page-break-before: always; /* For print context */
  break-before: page;        /* Modern browser support */
}
  
  .terms-condition {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px !important;
    line-height: 1.6;
    /* padding: 60px; */
    padding: 8px;
  }
  
  /* ----------------------------------- *
  *   Typography
  * ----------------------------------- */
  .terms-condition h1 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 700 !important;
    margin: 1rem 0rem;
  }
  
  .terms-condition h2 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    font-weight: 700 !important;
    margin: 0.5rem 0rem;
  }
  
  .terms-condition h3 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    line-height: 1.6;
    font-weight: 700 !important;
    margin: 0.3rem 0rem;
  }
  
  .terms-condition h4 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    line-height: 1.6;
    font-weight: 700 !important;
    margin: 0.2rem 0rem;
  }
  
  .terms-condition h5 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    color: #666666;
  }
  
  .terms-condition p {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    margin-bottom: 0.5rem;
  }
  
  .terms-condition span {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }
  
  .terms-condition strong {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }
  
  .terms-condition ol {
    font-family: Arial, Helvetica, sans-serif;
    padding-left: 0.5rem;
    position: relative;
    margin-top: 0.3rem;
    font-size: 10px;
  }
  
  td, th, tr {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }
  
  .terms-condition ol[type="a"] {
    list-style-type: lower-alpha;
  }
  
  .terms-condition ol[type="i"] {
    list-style-type: lower-roman; /* Ensure Roman numerals are used */
  }
  
  .terms-condition ol li {
    font-family: Arial, Helvetica, sans-serif;
    margin-bottom: 0.3rem;
    font-size: 10px;
  }
  
  .terms > ol {
    font-family: Arial, Helvetica, sans-serif;
    padding-left: 0rem;
    margin-left: 0rem;
    counter-reset: item;
  }
  
  .terms > ol > li {
    font-family: Arial, Helvetica, sans-serif;
    display: block;
  }
  
  .terms > ol > li:before {
    font-family: Arial, Helvetica, sans-serif;
    content: counters(item, ". ") ". ";
    counter-increment: item;
  }
  
  .terms > ol > li > ol {
    font-family: Arial, Helvetica, sans-serif;
    counter-reset: item;
    padding-left: 0.5rem;
    margin-left: 0rem;
  }
  
  .terms > ol > li > ol > li {
    font-family: Arial, Helvetica, sans-serif;
    display: block;
    padding-left: 0.5rem;
    margin-left: 0rem;
  }
  
  .terms > ol > li > ol > li:before {
    font-family: Arial, Helvetica, sans-serif;
    content: counters(item, ". ") ". ";
    counter-increment: item;
  }
  
  .terms-condition small {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    color: #9f9f9f;
    font-weight: normal;
  }
  </style>
  </head>
  <body>
  <div class="terms-condition">
    ${proofContent}
  </div>
  </body>
  </html>
  `;

    // this script for production
    const launchOptions = {
      headless: true, // Run in headless mode
      ignoreDefaultArgs: ["--disable-extensions"],
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
      dumpio: false,
      timeout: 120000,
    };

    // Add executablePath only if environment is PROD
    if (process.env.ENVIRONMENT === "PROD") {
      launchOptions.executablePath = "/usr/bin/google-chrome-stable";

      // launchOptions.executablePath = "/usr/bin/chromium-browser"; // Path to the installed Chromium on Ubuntu
    }

    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(styledAgreementContent, {
      waitUntil: "networkidle0",
    });

    const generatedPdfBuffer = await page.pdf({
      path: "agreement.pdf",
      format: "A4",
      margin: {
        top: "20mm",
        right: "10mm",
        bottom: "20mm",
        left: "10mm",
      },
      printBackground: true,
    });

    await browser.close();

    // Generate a unique key for the S3 object
    const s3Key = `agreements/${propertyId}-proof.pdf`;

    // Generate a presigned URL for uploading
    const presignedUrl = await s3.getSignedUrlPromise("putObject", {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: "application/pdf",
      Expires: 600, // URL expires in 600 seconds (10 minutes)
    });

    // Upload the PDF to S3 using the presigned URL
    await axios.put(presignedUrl, generatedPdfBuffer, {
      headers: { "Content-Type": "application/pdf" },
    });

    return s3Key;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.generatePresignedUrl = async (req, res) => {
  try {
    const { folder, id } = req.body;
    if (!folder || !id) {
      res.status(404).json({ success: false, message: "Invalid data" });
    }
    const key = `${folder}/${id}.png`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 60,
      ContentType: "image/png",
    };

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);

    res.status(200).json({
      success: true,
      data: { uploadURL, key },
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate pre-signed URL" });
  }
};

const generatePresignedUrl = async (folder, id, blob) => {
  try {
    const key = `${folder}/${id}.png`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 60,
      ContentType: "image/png",
    };

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    if (uploadURL) {
      await axios.put(uploadURL, blob, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    }
    return { uploadURL, key }; // Return both the URL and the key
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw new Error("Failed to generate pre-signed URL");
  }
};

function base64ToBuffer(base64Data) {
  // Remove the data URL prefix if present
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

exports.createAuthSchedule = async (req, res) => {
  const { id, name, email } = req.user;
  const propertyId = req.body.propertyId;
  const {
    propertyAddress: address,
    solicitor,
    vendors,
    commissionFee,
    commissionRange,
    startPrice,
    endPrice,
    saleProcess,
    status,
    fraudPrevention,
    terms,
    marketing,
    recommendedSales,
    recommendedSold,
    prepareMarketing,
    termsCondition,
  } = req.body.formattedData;

  try {
    // Check if a UserProperty with the same userId and propertyId already exists
    const authScheduleExists = await AuthSchedule.findOne({
      userId: id,
      propertyId,
    });

    if (authScheduleExists) {
      return res.status(200).json({ success: true, data: authScheduleExists });
    }

    const filteredVendors = vendors.filter(
      (vendor) => vendor.agreeTerms === true
    );

    if (filteredVendors.length) {
      filteredVendors.forEach(async (vendor) => {
        const post = {
          msg: `Hi ${name}, ${vendor.firstName} ${vendor.lastName} has signed the agreement for the property ${address}`,
          link: `${REACT_APP_FRONTEND_URL}/chat/${encodeURIComponent(
            address
          )}?tab=authorise-and-schedule`,
          title: "View Property",
        };

        const text = ` <html>
        <head>
          <title>eSign</title>
          <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        </head>
        <body>
          <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
            <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
              <tbody>
                <tr>
                  <td></td>
                  <td width="640">
                    <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                      <tbody>
                        <tr>
                          <td style="padding: 25px 24px; height:50px; text-align:center">
                            <img style="border: none; margin-top:30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 30px 24px;">
                            <table style="background-color: #fff; color: #000;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                <tr>
                                  <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
               
                                    <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                            ${post.msg}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                     <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
      <tr>
        <td style="padding-top: 30px;" align="center">
          <a
            style="
              font-size: 15px;
              color: #ffffff;
              background-color: #000000;
              font-family: Helvetica, Arial, Sans Serif;
              font-weight: bold;
              text-align: center;
              text-decoration: none;
              border-radius: 2px;
              display: inline-block;
            "
            href="${post.link}"
            target="_blank"
            rel="noopener"
          >
            <span style="padding: 0px 24px; line-height: 44px;">
              ${post.title}
            </span>
          </a>
        </td>
      </tr>
  
    </tbody>
  </table>
  
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
                              <tbody>
                                <tr>
                                  <td style="padding-bottom: 20px; text-align: center;">
                                    <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">${name}</div>
                                    <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                      <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Do Not Share This Email</strong><br /> This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.</p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Questions about the Document?</strong><br /> If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.</p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
        </html>`;

        await sendEmail(
          email, // Use agent's email
          `${vendor.firstName} ${vendor.lastName} has signed the agreement for the property ${address}`, // Subject
          text
        );
      });
    }

    const vendorPost = {
      msg: `Here is your signed copy of the sales agreement for the property ${address}`,
      link: `${REACT_APP_FRONTEND_URL}/agreement/${propertyId}`,
      title: "View Agreement",
    };

    const agentPost = {
      msg: `Hi ${name}, vendor has completed the document for the property ${address}`,
      link: `${REACT_APP_FRONTEND_URL}/agreement/${propertyId}`,
      title: "View Agreement",
    };

    const vendorText = ` <html>
      <head>
        <title>eSign</title>
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      </head>
      <body>
        <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
          <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
            <tbody>
              <tr>
                <td></td>
                <td width="640">
                  <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                    <tbody>
                      <tr>
                        <td style="padding: 25px 24px; height:50px; text-align:center">
                          <img style="border: none; margin-top:30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 30px 24px;">
                          <table style="background-color: #fff; color: #000;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                            <tbody>
                              <tr>
                                <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
                                  <img style="width: 75px; height: 75px;" src="https://myapp.ausrealty.com.au/img/document.png" alt="" width="75" height="75" />
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                    <tbody>
                                      <tr>
                                        <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                          ${vendorPost.msg}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                   <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
  <tbody>
    <tr>
      <td style="padding-top: 30px;" align="center">
        <a
          style="
            font-size: 15px;
            color: #ffffff;
            background-color: #000000;
            font-family: Helvetica, Arial, Sans Serif;
            font-weight: bold;
            text-align: center;
            text-decoration: none;
            border-radius: 2px;
            display: inline-block;
          "
          href="${vendorPost.link}"
          target="_blank"
          rel="noopener"
        >
          <span style="padding: 0px 24px; line-height: 44px;">
            ${vendorPost.title}
          </span>
        </a>
      </td>
    </tr>
  </tbody>
</table>

                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
                            <tbody>
                              <tr>
                                <td style="padding-bottom: 20px; text-align: center;">
                                  <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">${name}</div>
                                  <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                    <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Do Not Share This Email</strong><br /> This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Questions about the Document?</strong><br /> If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>`;

    const agentText = ` <html>
      <head>
        <title>eSign</title>
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      </head>
      <body>
        <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
          <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
            <tbody>
              <tr>
                <td></td>
                <td width="640">
                  <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                    <tbody>
                      <tr>
                        <td style="padding: 25px 24px; height:50px; text-align:center">
                          <img style="border: none; margin-top:30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 30px 24px;">
                          <table style="background-color: #fff; color: #000;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                            <tbody>
                              <tr>
                                <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
                                  <img style="width: 75px; height: 75px;" src="https://myapp.ausrealty.com.au/img/document.png" alt="" width="75" height="75" />
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                    <tbody>
                                      <tr>
                                        <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                          ${agentPost.msg}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                   <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
  <tbody>
    <tr>
      <td style="padding-top: 30px;" align="center">
        <a
          style="
            font-size: 15px;
            color: #ffffff;
            background-color: #000000;
            font-family: Helvetica, Arial, Sans Serif;
            font-weight: bold;
            text-align: center;
            text-decoration: none;
            border-radius: 2px;
            display: inline-block;
          "
          href="${agentPost.link}"
          target="_blank"
          rel="noopener"
        >
          <span style="padding: 0px 24px; line-height: 44px;">
            ${agentPost.title}
          </span>
        </a>
      </td>
    </tr>
  </tbody>
</table>

                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
                            <tbody>
                              <tr>
                                <td style="padding-bottom: 20px; text-align: center;">
                                  <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">${name}</div>
                                  <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                    <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Do Not Share This Email</strong><br /> This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Questions about the Document?</strong><br /> If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>`;

    // Check if all vendors agreed to the terms
    const allVendorsAgree = vendors.every(
      (vendor) => vendor.agreeTerms === true
    );

    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      if (vendor.isSigned) {
        // Generate URL for vendor signature
        const signatureResult = await generatePresignedUrl(
          `vendor-signatures`,
          `${propertyId}-vendor-${i}`,
          base64ToBuffer(vendor.signature)
        );
        vendor.signature = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${signatureResult.key}`;
      }

      // Generate URL for vendor license
      const licenceResult = await generatePresignedUrl(
        `vendor-licences`,
        `${propertyId}-vendor-${i}`,
        base64ToBuffer(vendor.licence)
      );
      vendor.licence = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${licenceResult.key}`;
    }

    // Initialize agreementId and proofId with default values (null or empty string)
    let agreementId = null;
    let proofId = null;

    if (allVendorsAgree) {
      // Generate agreement and proof only if all vendors agree
      agreementId = await generateAgreement(
        req.user,
        req.body.formattedData,
        propertyId
      );
      proofId = await generateProof(
        req.user,
        req.body.formattedData,
        propertyId
      );

      await sendEmail(
        filteredVendors.map((vendor) => vendor.email).join(","), // Use vendor's email
        `Ausrealty eSign: Sales agreement copy of ${address}`, // Subject
        vendorText
      );

      await sendEmail(
        email, // Use agent's email
        `Sales Agreement completed: ${address}`, // Subject
        agentText,
        ["welcome@ausrealty.com.au", "concierge@ausrealty.com.au"]
      );

      // Extract vendor first and last names, and join them into a string
      const vendorNames = vendors
        .map((vendor) => `${vendor.firstName} ${vendor.lastName}`)
        .join(", ");

      // Construct the solicitor text with corrected template literals
      const solicitorText = `
      <p>Dear ${solicitor.name},</p>
      <p>
        Please be advised Ausrealty has been appointed as the selling
        agents for the property at ${address} on behalf of ${vendorNames}.
      </p>
      <p>
        The vendor${vendorNames.length > 1 ? 's' : ''} ${vendorNames} ${vendorNames.length > 1 ? 'have' : 'has'} requested you kindly prepare the contract of sale
        so we can commence our marketing campaign.
      </p>
      <p>
        Please find full contact details for the vendors:
      </p>
      ${vendors.map(
        (vendor) => `
        <p>
          Name: ${vendor.firstName} ${vendor.lastName} <br />
          Email: ${vendor.email} <br />
          Mobile: ${vendor.mobile}
        </p>
      `
      ).join('')}
      <p>
        Please feel free to contact our office should you have any further queries.
      </p>
      <p>Thank you</p>`;
      
      // Extract vendor emails and filter out any undefined/null values
      const vendorEmails = vendors
        .map((vendor) => vendor.email)
        .filter((email) => email); // Filters out falsy values (null, undefined, etc.)

      // Send the email
      await sendEmail(
        solicitor.email, // Recipient email
        `Contract Request: ${address}`, // Subject
        solicitorText, // Email content
        [email, ...vendorEmails] // CC list
      );

      await UserProperty.updateOne(
        { _id:mongoose.Types.ObjectId(propertyId) },
        { $set: { "boxStatus.3.status": "complete" } }
      );
    }

    solicitor.sentDate = formatDateToAEDT(null);

    // Create the AuthSchedule with the updated filtered vendors array
    const authSchedule = await AuthSchedule.create({
      userId: id,
      propertyId,
      address,
      solicitor,
      vendors, // Only vendors who agreed to terms
      commissionFee,
      commissionRange,
      startPrice,
      endPrice,
      saleProcess,
      status,
      fraudPrevention,
      terms,
      marketing,
      prepareMarketing,
      recommendedSales,
      recommendedSold,
      agreementId: agreementId
        ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${agreementId}`
        : null,
      proofId: proofId
        ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${proofId}`
        : null,
      isLock: true,
      isCompleted: allVendorsAgree ? true : false,
      agreementDate: allVendorsAgree ? formatDateToAEDT(null) : null,
      termsCondition,
    });

    return res.status(200).json({ success: true, data: authSchedule });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSignatureUrl = async (req, res) => {
  try {
    const id = req.params;

    const objectId = new mongoose.Types.ObjectId(id);

    const authSchedule = await AuthSchedule.findOne({ propertyId: objectId });

    if (!authSchedule) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Get agreement URL
    if (!authSchedule.agreementId) {
      return res
        .status(404)
        .json({ success: false, message: "Agreement not found" });
    }

    const agreementUrl = authSchedule.agreementId;
    const agreementUrlObj = new URL(agreementUrl);
    const agreementKey = agreementUrlObj.pathname.startsWith("/")
      ? agreementUrlObj.pathname.substring(1)
      : agreementUrlObj.pathname;

    const agreementParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: agreementKey,
      Expires: 3600, // URL expires in 1 hour
    };

    const agreementSignedUrl = s3.getSignedUrl("getObject", agreementParams);

    const proofUrl = authSchedule.proofId;
    const proofUrlObj = new URL(proofUrl);
    const proofKey = proofUrlObj.pathname.startsWith("/")
      ? proofUrlObj.pathname.substring(1)
      : proofUrlObj.pathname;

    const proofParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: proofKey,
      Expires: 3600, // URL expires in 1 hour
    };

    const proofSignedUrl = s3.getSignedUrl("getObject", proofParams);
    //

    // Loop through vendors to get licences
    const vendors = authSchedule.vendors || [];
    const vendorsWithLicenceUrls = await Promise.all(
      vendors.map(async (vendor) => {
        if (vendor.licence) {
          const licenceUrlObj = new URL(vendor.licence);
          const licenceKey = licenceUrlObj.pathname.startsWith("/")
            ? licenceUrlObj.pathname.substring(1)
            : licenceUrlObj.pathname;

          const licenceParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: licenceKey,
            Expires: 3600, // URL expires in 1 hour
          };

          const licenceSignedUrl = s3.getSignedUrl("getObject", licenceParams);
          vendor.licenceSignedUrl = licenceSignedUrl;
        }

        // Optional: Get signature signed URL if needed
        //   if (vendor.signature) {
        //     const signatureUrlObj = new URL(vendor.signature);
        //     const signatureKey = signatureUrlObj.pathname.startsWith("/")
        //       ? signatureUrlObj.pathname.substring(1)
        //       : signatureUrlObj.pathname;

        //     const signatureParams = {
        //       Bucket: process.env.S3_BUCKET_NAME,
        //       Key: signatureKey,
        //       Expires: 3600, // URL expires in 1 hour
        //     };

        //     const signatureSignedUrl = s3.getSignedUrl("getObject", signatureParams);
        //     vendor.signatureSignedUrl = signatureSignedUrl;
        //   }

        return vendor;
      })
    );

    res.status(200).json({
      success: true,
      data: {
        agreementUrl: agreementSignedUrl,
        vendors: vendorsWithLicenceUrls,
        proofUrl: proofSignedUrl,
      },
    });
  } catch (error) {
    console.error("Error generating signature URL:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getVendorsSignatureUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const objectId = new mongoose.Types.ObjectId(id);

    const authSchedule = await AuthSchedule.findOne({ propertyId: objectId });

    if (!authSchedule) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    // Loop through vendors to get licences
    const vendors = authSchedule.vendors || [];
    const vendorsWithSignatureUrls = await Promise.all(
      vendors.map(async (vendor) => {
        if (vendor.signature) {
          try {
            const signatureUrlObj = new URL(vendor.signature);
            const signatureKey = signatureUrlObj.pathname.startsWith("/")
              ? signatureUrlObj.pathname.substring(1)
              : signatureUrlObj.pathname;

            const signatureParams = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: signatureKey,
              Expires: 3600, // URL expires in 1 hour
            };

            const signatureSignedUrl = s3.getSignedUrl(
              "getObject",
              signatureParams
            );

            return {
              ...vendor,
              signatureSignedUrl,
            };
          } catch (error) {
            console.error("Error generating signed URL:", error);
            return null; // Return null if there is an error in generating the URL
          }
        } else {
          return null; // Return null if the vendor has no signature
        }
      })
    );

    res.status(200).json({
      success: true,
      data: vendorsWithSignatureUrls,
    });
  } catch (error) {
    console.error("Error generating signature URL:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get AuthSchedule by PropertyId
exports.getAuthScheduleByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const objectId = new mongoose.Types.ObjectId(propertyId);

    const authSchedule = await AuthSchedule.findOne({
      propertyId: objectId,
    });

    if (!authSchedule) {
      return res
        .status(404)
        .json({ success: false, message: "Auth Schedule not found" });
    }

    return res.status(200).json({ success: true, data: authSchedule });
  } catch (error) {
    console.error("Error fetching AuthSchedule: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendToSign = async (req, res) => {
  try {
    const { id, name, email } = req.user;
    if (req.body.formattedData) {
      const vendorIndex = req.body.vendorIndex;
      const {
        propertyId,
        propertyAddress,
        solicitor,
        vendors,
        commissionFee,
        commissionRange,
        startPrice,
        endPrice,
        saleProcess,
        status,
        fraudPrevention,
        terms,
        marketing,
        recommendedSales,
        recommendedSold,
        prepareMarketing,
        termsCondition,
      } = req.body.formattedData;

      // Check if a UserProperty with the same userId and propertyId already exists
      const authScheduleExists = await AuthSchedule.findOne({
        userId: id,
        propertyId,
      });

      if (authScheduleExists) {
        return res
          .status(200)
          .json({ success: true, data: authScheduleExists });
      }

      // Prepare post details
      const post = {
        msg: `${name} sent you a document to review and sign.`,
        link: `${REACT_APP_FRONTEND_URL}/esign/${propertyId}/${vendorIndex}`,
        title: "Review & Sign",
      };

      // Prepare email content
      const text = `<html>
        <head>
          <title>eSign</title>
          <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        </head>
        <body>
          <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
            <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
              <tbody>
                <tr>
                  <td></td>
                  <td width="640">
                    <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                      <tbody>
                        <tr>
                          <td style="padding: 25px 24px; height: 50px; text-align: center;">
                            <img style="border: none; margin-top: 30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 30px 24px">
                            <table style="background-color: #fff; color: #000" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                <tr>
                                  <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
                                    <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                            ${post.msg}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top: 30px" align="center">
                                            <a style="font-size: 15px; color: #ffffff; background-color: #000000; font-family: Helvetica, Arial, Sans Serif; font-weight: bold; text-align: center; text-decoration: none; border-radius: 2px; display: inline-block;" href="${post.link}" target="_blank" rel="noopener">
                                              <span style="padding: 0px 24px; line-height: 44px;">
                                                ${post.title}
                                              </span>
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%">
                              <tbody>
                                <tr>
                                  <td style="padding-bottom: 20px; text-align: center">
                                    <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">
                                      ${name}
                                    </div>
                                    <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                      <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;">
                              <strong role="heading" aria-level="3">Do Not Share This Email</strong><br />
                              This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.
                            </p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;">
                              <strong role="heading" aria-level="3">Questions about the Document?</strong><br />
                              If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.
                            </p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">
                              This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>`;

      // Send the email to the vendor
      await sendEmail(
        vendors[vendorIndex].email, // Recipient email
        `Ausrealty eSign: ${propertyAddress}`, // Subject
        text // Email content
      );

      // Update the vendor's sent date
      vendors[vendorIndex].sentDate = formatDateToAEDT(null);

      for (let i = 0; i < vendors.length; i++) {
        const vendor = vendors[i];
        if (vendor.isSigned) {
          // Generate URL for vendor signature
          const signatureResult = await generatePresignedUrl(
            `vendor-signatures`,
            `${propertyId}-vendor-${i}`,
            base64ToBuffer(vendor.signature)
          );
          vendor.signature = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${signatureResult.key}`;
        }

        // Generate URL for vendor license
        const licenceResult = await generatePresignedUrl(
          `vendor-licences`,
          `${propertyId}-vendor-${i}`,
          base64ToBuffer(vendor.licence)
        );
        vendor.licence = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${licenceResult.key}`;
      }

      // Create the AuthSchedule with the updated filtered vendors array
      const authSchedule = await AuthSchedule.create({
        userId: id,
        propertyId,
        address: propertyAddress,
        solicitor,
        vendors, // Only vendors who agreed to terms
        commissionFee,
        commissionRange,
        startPrice,
        endPrice,
        saleProcess,
        status,
        fraudPrevention,
        terms,
        marketing,
        prepareMarketing,
        recommendedSales,
        recommendedSold,
        isLock: true,
        termsCondition,
      });

      return res.status(200).json({ success: true, data: authSchedule });
    }

    const { propertyAddress, propertyId, vendor, vendorIndex } =
      req.body.payload;

    // Check if AuthSchedule exists
    const authScheduleExists = await AuthSchedule.findOne({
      userId: id,
      propertyId,
    });

    if (!authScheduleExists) {
      return res
        .status(404)
        .json({ success: false, message: "AuthSchedule not found" });
    }

    // Prepare post details
    const post = {
      msg: `${name} sent you a document to review and sign.`,
      link: `${REACT_APP_FRONTEND_URL}/esign/${propertyId}/${vendorIndex}`,
      title: "Review & Sign",
    };

    // Prepare email content
    const text = `<html>
        <head>
          <title>eSign</title>
          <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        </head>
        <body>
          <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
            <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
              <tbody>
                <tr>
                  <td></td>
                  <td width="640">
                    <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                      <tbody>
                        <tr>
                          <td style="padding: 25px 24px; height: 50px; text-align: center;">
                            <img style="border: none; margin-top: 30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 30px 24px">
                            <table style="background-color: #fff; color: #000" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                <tr>
                                  <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
                                    <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                            ${post.msg}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top: 30px" align="center">
                                            <a style="font-size: 15px; color: #ffffff; background-color: #000000; font-family: Helvetica, Arial, Sans Serif; font-weight: bold; text-align: center; text-decoration: none; border-radius: 2px; display: inline-block;" href="${post.link}" target="_blank" rel="noopener">
                                              <span style="padding: 0px 24px; line-height: 44px;">
                                                ${post.title}
                                              </span>
                                            </a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%">
                              <tbody>
                                <tr>
                                  <td style="padding-bottom: 20px; text-align: center">
                                    <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">
                                      ${name}
                                    </div>
                                    <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                      <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;">
                              <strong role="heading" aria-level="3">Do Not Share This Email</strong><br />
                              This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.
                            </p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;">
                              <strong role="heading" aria-level="3">Questions about the Document?</strong><br />
                              If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.
                            </p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">
                              This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>`;

    // Send the email to the vendor
    await sendEmail(
      vendor.email, // Recipient email
      `Ausrealty eSign: ${propertyAddress}`, // Subject
      text // Email content
    );

    // Update the AuthSchedule for the vendor
    const updatedAuthSchedule = await AuthSchedule.findOneAndUpdate(
      {
        userId: id,
        propertyId,
      },
      {
        $set: {
          [`vendors.${vendorIndex}.sentDate`]: formatDateToAEDT(null),
        },
      },
      { new: true }
    );

    return res.status(200).json({ success: true, data: updatedAuthSchedule });
  } catch (error) {
    console.error("Error sending eSign request:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAuthSchedule = async (req, res) => {
  const propertyId = req.params.propertyId;
  const objectId = new mongoose.Types.ObjectId(propertyId);
  const { signature, signedDate, agreeTerms, isSigned } = req.body.vendor;
  const index = req.body.vendorId;

  try {
    const authScheduleExists = await AuthSchedule.findOne({
      propertyId: objectId,
    }).populate("userId");

    const { name, email } = authScheduleExists.userId;

    const { vendors, address } = authScheduleExists;

    const vendor = vendors[index];
    vendor.agreeTerms = agreeTerms;
    vendor.signedDate = signedDate;
    vendor.isSigned = isSigned;

    if (isSigned) {
      // Generate URL for vendor signature
      const signatureResult = await generatePresignedUrl(
        `vendor-signatures`,
        `${propertyId}-vendor-${index}`,
        base64ToBuffer(signature)
      );
      vendor.signature = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${signatureResult.key}`;
    }

    const post = {
      msg: `Hi ${name}, ${vendor.firstName} ${vendor.lastName} has signed the agreement for the property ${address}`,
      link: `${REACT_APP_FRONTEND_URL}/chat/${encodeURIComponent(
        address
      )}?tab=authorise-and-schedule`,
      title: "View Property",
    };

    const text = ` <html>
      <head>
        <title>eSign</title>
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      </head>
      <body>
        <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
          <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
            <tbody>
              <tr>
                <td></td>
                <td width="640">
                  <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                    <tbody>
                      <tr>
                        <td style="padding: 25px 24px; height:50px; text-align:center">
                          <img style="border: none; margin-top:30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 30px 24px;">
                          <table style="background-color: #fff; color: #000;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                            <tbody>
                              <tr>
                                <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
             
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                    <tbody>
                                      <tr>
                                        <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                          ${post.msg}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                   <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
  <tbody>
    <tr>
      <td style="padding-top: 30px;" align="center">
        <a
          style="
            font-size: 15px;
            color: #ffffff;
            background-color: #000000;
            font-family: Helvetica, Arial, Sans Serif;
            font-weight: bold;
            text-align: center;
            text-decoration: none;
            border-radius: 2px;
            display: inline-block;
          "
          href="${post.link}"
          target="_blank"
          rel="noopener"
        >
          <span style="padding: 0px 24px; line-height: 44px;">
            ${post.title}
          </span>
        </a>
      </td>
    </tr>

  </tbody>
</table>

                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
                            <tbody>
                              <tr>
                                <td style="padding-bottom: 20px; text-align: center;">
                                  <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">${name}</div>
                                  <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                    <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Do Not Share This Email</strong><br /> This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Questions about the Document?</strong><br /> If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>`;

    await sendEmail(
      email, // Use agent's email
      `${vendor.firstName} ${vendor.lastName} has signed the agreement for the property ${address}`, // Subject
      text
    );

    const allVendorsAgree = vendors.every(
      (vendor) => vendor.agreeTerms === true
    );
    let agreementId = null;
    let proofId = null;

    if (allVendorsAgree) {
      const vendorPost = {
        msg: `Here is your signed copy of the sales agreement for the property ${address}`,
        link: `${REACT_APP_FRONTEND_URL}/agreement/${propertyId}`,
        title: "View Agreement",
      };

      const agentPost = {
        msg: `Hi ${name}, vendor has completed the document for the property ${address}`,
        link: `${REACT_APP_FRONTEND_URL}/agreement/${propertyId}`,
        title: "View Agreement",
      };

      const vendorText = ` <html>
        <head>
          <title>eSign</title>
          <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        </head>
        <body>
          <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
            <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
              <tbody>
                <tr>
                  <td></td>
                  <td width="640">
                    <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                      <tbody>
                        <tr>
                          <td style="padding: 25px 24px; height:50px; text-align:center">
                            <img style="border: none; margin-top:30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 30px 24px;">
                            <table style="background-color: #fff; color: #000;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                <tr>
                                  <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
                                    <img style="width: 75px; height: 75px;" src="https://myapp.ausrealty.com.au/img/document.png" alt="" width="75" height="75" />
                                    <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                            ${vendorPost.msg}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                     <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
      <tr>
        <td style="padding-top: 30px;" align="center">
          <a
            style="
              font-size: 15px;
              color: #ffffff;
              background-color: #000000;
              font-family: Helvetica, Arial, Sans Serif;
              font-weight: bold;
              text-align: center;
              text-decoration: none;
              border-radius: 2px;
              display: inline-block;
            "
            href="${vendorPost.link}"
            target="_blank"
            rel="noopener"
          >
            <span style="padding: 0px 24px; line-height: 44px;">
              ${vendorPost.title}
            </span>
          </a>
        </td>
      </tr>
    </tbody>
  </table>
  
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
                              <tbody>
                                <tr>
                                  <td style="padding-bottom: 20px; text-align: center;">
                                    <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">${name}</div>
                                    <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                      <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Do Not Share This Email</strong><br /> This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.</p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Questions about the Document?</strong><br /> If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.</p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
        </html>`;

      const agentText = ` <html>
        <head>
          <title>eSign</title>
          <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        </head>
        <body>
          <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
            <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
              <tbody>
                <tr>
                  <td></td>
                  <td width="640">
                    <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                      <tbody>
                        <tr>
                          <td style="padding: 25px 24px; height:50px; text-align:center">
                            <img style="border: none; margin-top:30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 30px 24px;">
                            <table style="background-color: #fff; color: #000;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                              <tbody>
                                <tr>
                                  <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
                                    <img style="width: 75px; height: 75px;" src="https://myapp.ausrealty.com.au/img/document.png" alt="" width="75" height="75" />
                                    <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                            ${agentPost.msg}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                     <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
    <tbody>
      <tr>
        <td style="padding-top: 30px;" align="center">
          <a
            style="
              font-size: 15px;
              color: #ffffff;
              background-color: #000000;
              font-family: Helvetica, Arial, Sans Serif;
              font-weight: bold;
              text-align: center;
              text-decoration: none;
              border-radius: 2px;
              display: inline-block;
            "
            href="${agentPost.link}"
            target="_blank"
            rel="noopener"
          >
            <span style="padding: 0px 24px; line-height: 44px;">
              ${agentPost.title}
            </span>
          </a>
        </td>
      </tr>
    </tbody>
  </table>
  
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
                              <tbody>
                                <tr>
                                  <td style="padding-bottom: 20px; text-align: center;">
                                    <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">${name}</div>
                                    <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                      <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Do Not Share This Email</strong><br /> This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.</p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Questions about the Document?</strong><br /> If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.</p>
                            <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
        </html>`;

      await sendEmail(
        vendors.map((vendor) => vendor.email).join(","), // Use vendor's email
        `Ausrealty eSign: Sales agreement copy of ${address}`, // Subject
        vendorText
      );

      await sendEmail(
        email, // Use agent's email
        `Sales Agreement completed: ${address}`, // Subject
        agentText,
        ["welcome@ausrealty.com.au", "concierge@ausrealty.com.au"]
      );

      // Construct the solicitor text with corrected template literals
      const solicitorText = `
      <p>Dear ${solicitor.name},</p>
      <p>
        Please be advised Ausrealty has been appointed as the selling
        agents for the property at ${address} on behalf of ${vendorNames}.
      </p>
      <p>
        The vendor${vendorNames.length > 1 ? 's' : ''} ${vendorNames} ${vendorNames.length > 1 ? 'have' : 'has'} requested you kindly prepare the contract of sale
        so we can commence our marketing campaign.
      </p>
      <p>
        Please find full contact details for the vendors:
      </p>
      ${vendors.map(
        (vendor) => `
        <p>
          Name: ${vendor.firstName} ${vendor.lastName} <br />
          Email: ${vendor.email} <br />
          Mobile: ${vendor.mobile}
        </p>
      `
      ).join('')}
      <p>
        Please feel free to contact our office should you have any further queries.
      </p>
      <p>Thank you</p>`;
      
      // Extract vendor emails and filter out any undefined/null values
      const vendorEmails = vendors
        .map((vendor) => vendor.email)
        .filter((email) => email); // Filters out falsy values (null, undefined, etc.)

      // Send the email
      await sendEmail(
        solicitor.email, // Recipient email
        `Contract Request: ${address}`, // Subject
        solicitorText, // Email content
        [email, ...vendorEmails] // CC list
      );

      await UserProperty.updateOne(
        { _id: mongoose.Types.ObjectId(propertyId) },
        { $set: { "boxStatus.3.status": "complete" } }
      );

      authScheduleExists.isCompleted = allVendorsAgree ? true : false;
      authScheduleExists.agreementDate = allVendorsAgree
        ? formatDateToAEDT(null)
        : null;

      // Generate agreement and proof only if all vendors agree
      agreementId = await generateAgreement(
        authScheduleExists.userId,
        authScheduleExists,
        propertyId
      );
      proofId = await generateProof(
        authScheduleExists.userId,
        authScheduleExists,
        propertyId
      );
    }

    (authScheduleExists.agreementId = agreementId
      ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${agreementId}`
      : null),
      (authScheduleExists.proofId = proofId
        ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${proofId}`
        : null),
      // Save the updated vendors array back to the document
      (authScheduleExists.vendors[index] = vendor);

    // Save the AuthSchedule document
    await authScheduleExists.save();

    return res.status(200).json({ success: true, data: authScheduleExists });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateViewedDate = async (req, res) => {
  const propertyId = req.params.propertyId;
  const objectId = new mongoose.Types.ObjectId(propertyId);
  const { viewedDate, index } = req.body;

  try {
    const authScheduleExists = await AuthSchedule.findOne({
      propertyId: objectId,
    }).populate("userId");

    const { name, email } = authScheduleExists.userId;

    const { vendors, address } = authScheduleExists;

    const vendor = vendors[index];

    const post = {
      msg: `Hi ${name}, ${vendor.firstName} ${vendor.lastName} has viewed the agreement for the property ${address}`,
    };

    const text = ` <html>
      <head>
        <title>eSign</title>
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      </head>
      <body>
        <div style="background-color: #eaeaea; padding: 2%; font-family: Helvetica, Arial, Sans Serif;">
          <table dir="" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
            <tbody>
              <tr>
                <td></td>
                <td width="640">
                  <table style="border-collapse: collapse; background-color: #ffffff; max-width: 640px;">
                    <tbody>
                      <tr>
                        <td style="padding: 25px 24px; height:50px; text-align:center">
                          <img style="border: none; margin-top:30px" src="https://myapp.ausrealty.com.au/img/ausrealtylogo.png" alt="Ausrealty eSign" width="130" />
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 30px 24px;">
                          <table style="background-color: #fff; color: #000;" role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" align="center">
                            <tbody>
                              <tr>
                                <td style="padding: 28px 36px 36px 36px; border-radius: 2px; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; width: 100%; text-align: center;">
                   <img style="width: 75px; height: 75px;" src="https://myapp.ausrealty.com.au/img/document.png" alt="" width="75" height="75" />
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                                    <tbody>
                                      <tr>
                                        <td style="padding-top: 24px; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; border: none; text-align: center; color: #000;" align="center">
                                          ${post.msg}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0px 24px 24px 24px; color: #000000; font-size: 16px; font-family: Helvetica, Arial, Sans Serif; background-color: white; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
                            <tbody>
                              <tr>
                                <td style="padding-bottom: 20px; text-align: center;">
                                  <div style="font-family: Helvetica, Arial, Sans Serif; font-weight: bold; line-height: 18px; font-size: 15px; color: #333333;">${name}</div>
                                  <div style="font-family: Helvetica, Arial, Sans Serif; line-height: 18px; font-size: 15px; color: #666666;">
                                    <a href="mailto:${email}" target="_blank" rel="noopener">${email}</a>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 30px 24px 45px 24px; background-color: #fff;">
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Do Not Share This Email</strong><br /> This email contains a secure link to Ausrealty eSign. Please do not share this email and link with others.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 13px; color: #666666; line-height: 18px;"><strong role="heading" aria-level="3">Questions about the Document?</strong><br /> If you need to modify the document or have questions about the details in the document, please reach out to the sender by emailing them directly.</p>
                          <p style="margin-bottom: 1em; font-family: Helvetica, Arial, Sans Serif; font-size: 10px; color: #666666; line-height: 14px;">This message was sent to you by ${name} who is using the Ausrealty eSign Electronic Signature Service. If you would rather not receive email from this sender, you may contact the sender with your request.</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>`;

    await sendEmail(
      email, // Use agent's email
      `${vendor.firstName} ${vendor.lastName} has viewed the agreement for the property ${address}`, // Subject
      text
    );

    vendor.viewedDate = viewedDate;

    authScheduleExists.vendors[index] = vendor;

    // Save the AuthSchedule document
    await authScheduleExists.save();

    return res.status(200).json({ success: true, data: authScheduleExists });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAuthSchedule = async (req, res) => {
  try {
    const { id } = req.user;

    const authSchedules = await AuthSchedule.find({
      userId: id,
      isCompleted: true,
    });

    return res.status(200).json({ success: true, data: authSchedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAuthSchedule = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find and delete the AuthSchedule by propertyId
    const deletedAuthSchedule = await AuthSchedule.findOneAndDelete({
      propertyId,
    });

    if (!deletedAuthSchedule) {
      return res
        .status(404)
        .json({ success: false, message: "AuthSchedule not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "AuthSchedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting AuthSchedule:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

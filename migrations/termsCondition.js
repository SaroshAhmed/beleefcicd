// scripts/migrateMarketingPrice.js
const mongoose = require("mongoose");
const TermsCondition = require("../models/TermsCondition");

const databaseConnect = require("../config/database");

databaseConnect();

const newTerms = {
  privateTerms: `<div class="terms-condition">
    <div id="editable">  
        <h2>
            PART 3 | TERMS AND CONDITIONS OF EXCLUSIVE SELLING AGENCY AGREEMENT AND CONTINUING AGENCY AGREEMENT
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
                            "Agreement" means this Sales Inspection Report and Exclusive Selling Agency
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
                    PRICE
                    <ol>
                        <li>
                            If the Property is sold by private treaty, the Vendor
                            authorises the Licensee to sell the Property at the price
                            set out in Item C of the Particulars or such other price
                            the Vendor approves.
                        </li>
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
      </div>`,
  auctionTerms: `<div class="terms-condition">
    <div id="editable">  
        <h2>
            PART 3 | TERMS AND CONDITIONS OF EXCLUSIVE AUCTION AGENCY AGREEMENT AND CONTINUING AGENCY AGREEMENT
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
                            "Agreement" means this Sales Inspection Report and Exclusive Auction Agency
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
                    RESERVE PRICE
                    <ol>
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
      </div>`,
};

async function add() {
  console.log("Connected to MongoDB...");
  await TermsCondition.findOneAndUpdate(
    {}, // Use empty object to match all documents (you can also target specific documents if needed)
    newTerms, // New terms to be set
    { upsert: true, new: true } // Upsert: true creates new if not found, new: true returns the updated document
  );
  console.log("Data migration completed.");
}

add();

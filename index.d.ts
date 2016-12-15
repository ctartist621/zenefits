declare namespace Zenefits {
  interface Company {
    name: string;
    people: Reference[];
    url: string;
    logo_url: string;
    id: string;
  }

  interface Person {
    banks: Reference;
    city: string;
    company: Reference;
    country: string;
    date_of_birth: string;
    department: Reference;
    employments: Reference;
    first_name: string;
    preferred_name: string;
    id: string;
    last_name: string;
    location: Reference;
    manager: Reference;
    object: string;
    postal_code: string;
    state: string;
    status: Status;
    street1: string;
    street2: string;
    subordinates: Reference;
    title: string;
    work_email: string;
    personal_email: string;
    work_phone: string;
    personal_phone: string;
    gender: Gender;
    social_security_number: string;
  }

  enum Status {
    active,
    terminated,
    leave_of_absence,
    requested,
    setup,
    deleted
  }

  enum Gender {
    F,
    M
  }

  interface Employment {
    person: Reference;
    hire_date: string;
    id: string;
    termination_date: string;
    termination_type: TerminationType;
    employment_type: EmploymentType;
    comp_type: CompType;
    annual_salary: number;
    pay_rate: number;
    working_hours_per_week: number;
  }

  enum TerminationType {
    involuntary,
    regretted,
    non_regretted,
    unclassified,
    never_started
  }

  enum EmploymentType {
    full_time,
    part_time,
    temporary,
    casual,
    contract,
    labor_hire
  }

  enum CompType {
    salary,
    hourly
  }

  interface CompanyBankAccount {
    company: Reference;
    account_type: AccountType;
    account_number: number;
    routing_number: number;
    bank_name: string;
    id: string;
  }

  enum AccountType {
    checking,
    savings
  }

  interface Reference {
    url: string;
    object: string;
    ref_object: string;
  }
}

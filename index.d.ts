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
    status: string;
    street1: string;
    street2: string;
    subordinates: Reference;
    title: string;
    work_email: string;
    personal_email: string;
    work_phone: string;
    personal_phone: string;
    gender: string;
    social_security_number: string;
  }
  interface Reference {
    url: string;
    object: string;
    ref_object: string;
  }
}

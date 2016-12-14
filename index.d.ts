declare namespace zenefits {
  interface Company {
    name: string;
    people: People[];
    url: string;
    logo_url: string;
    id: string;
  }

  interface People {
    url: string;
    object: string;
    ref_object: string;
  }
}

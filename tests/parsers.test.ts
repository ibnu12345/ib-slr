import { describe, it, expect } from "vitest";
import {
  parseRis,
  parseBibTeX,
  parseCsv,
  normalizeDoi,
  normalizeTitle,
} from "../src/lib/importers/parsers";

describe("Milestone 2: Literature Import Parsers", () => {
  it("should normalize DOIs correctly", () => {
    expect(normalizeDoi("https://doi.org/10.1016/j.clinbiochem.2023.01.002")).toBe(
      "10.1016/j.clinbiochem.2023.01.002"
    );
    expect(normalizeDoi("http://dx.doi.org/10.1136/bmj.39335.541782.AD")).toBe(
      "10.1136/bmj.39335.541782.ad"
    );
    expect(normalizeDoi("doi: 10.1056/NEJMoa2002032 ")).toBe("10.1056/nejmoa2002032");
    expect(normalizeDoi("")).toBeUndefined();
  });

  it("should normalize titles for exact matching", () => {
    const raw = "  Smartphone-Based Interventions, in Type-2 Diabetes: A Clinical Trial!  ";
    const expected = "smartphone based interventions in type 2 diabetes a clinical trial";
    expect(normalizeTitle(raw)).toBe(expected);
  });

  it("should parse RIS bibliographic records with multi-line abstracts and multiple authors", () => {
    const risData = `TY  - JOUR
TI  - Clinical Artificial Intelligence in Diabetic Retinopathy Screening
AU  - Gulshan, Varun
AU  - Peng, Lily
PY  - 2023
JO  - JAMA Ophthalmology
VL  - 141
IS  - 2
SP  - 120
EP  - 128
DO  - 10.1001/jamaophthalmol.2022.5802
AB  - Objective: To determine diagnostic accuracy of deep learning algorithms.
Conclusion: Deep neural networks achieved high sensitivity and specificity.
ER  - 

TY  - JOUR
TI  - Telemedicine in Remote Rural Healthcare Clinics
AU  - Smith, John
PY  - 2022
JO  - BMJ Open
DO  - 10.1136/bmjopen-2022-061294
ER  - `;

    const parsed = parseRis(risData);
    expect(parsed.length).toBe(2);

    expect(parsed[0].title).toBe("Clinical Artificial Intelligence in Diabetic Retinopathy Screening");
    expect(parsed[0].authors).toBe("Gulshan, Varun; Peng, Lily");
    expect(parsed[0].publicationYear).toBe(2023);
    expect(parsed[0].journal).toBe("JAMA Ophthalmology");
    expect(parsed[0].doi).toBe("10.1001/jamaophthalmol.2022.5802");
    expect(parsed[0].pages).toBe("120-128");
    expect(parsed[0].abstract).toContain("Objective: To determine diagnostic accuracy");

    expect(parsed[1].title).toBe("Telemedicine in Remote Rural Healthcare Clinics");
    expect(parsed[1].authors).toBe("Smith, John");
    expect(parsed[1].publicationYear).toBe(2022);
  });

  it("should parse BibTeX format references accurately", () => {
    const bibData = `@article{chen2024digital,
  title={Digital Therapeutics for Chronic Glycemic Control},
  author={Chen, Lin and Williams, Karen E. and Davies, Melanie},
  journal={The Lancet Digital Health},
  volume={6},
  number={4},
  pages={e245-e255},
  year={2024},
  doi={10.1016/S2589-7500(24)00012-3},
  abstract={Evaluating randomized mobile education apps.}
}`;

    const parsed = parseBibTeX(bibData);
    expect(parsed.length).toBe(1);

    const ref = parsed[0];
    expect(ref.title).toBe("Digital Therapeutics for Chronic Glycemic Control");
    expect(ref.authors).toBe("Chen, Lin; Williams, Karen E.; Davies, Melanie");
    expect(ref.journal).toBe("The Lancet Digital Health");
    expect(ref.publicationYear).toBe(2024);
    expect(ref.doi).toBe("10.1016/s2589-7500(24)00012-3");
    expect(ref.volume).toBe("6");
    expect(ref.issue).toBe("4");
    expect(ref.pages).toBe("e245-e255");
  });

  it("should parse CSV files containing quoted fields and commas", () => {
    const csvData = `Title,Authors,Year,Journal,DOI,Abstract
"Continuous Telemetry in Diabetes, Hypertension, and Heart Failure","Patel, R.; Gupta, S.",2023,"Nature Medicine","10.1038/s41591-023-02451-w","Multicenter cohort study with quoted commas, in text."
"Automated Nutrition Counseling","Taylor, B.",2024,"Diabetes Care","10.2337/dc24-0012","Algorithm evaluation."`;

    const parsed = parseCsv(csvData);
    expect(parsed.length).toBe(2);

    expect(parsed[0].title).toBe("Continuous Telemetry in Diabetes, Hypertension, and Heart Failure");
    expect(parsed[0].authors).toBe("Patel, R.; Gupta, S.");
    expect(parsed[0].publicationYear).toBe(2023);
    expect(parsed[0].journal).toBe("Nature Medicine");
    expect(parsed[0].doi).toBe("10.1038/s41591-023-02451-w");

    expect(parsed[1].title).toBe("Automated Nutrition Counseling");
  });
});

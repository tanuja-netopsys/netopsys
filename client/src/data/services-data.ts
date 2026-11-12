import service01Img from "../assets/services/service-01.webp";
import service01SmImg from "../assets/services/service-01-sm.webp";
import service02Img from "../assets/services/service-02.webp";
import service02SmImg from "../assets/services/service-02-sm.webp";
import service03Img from "../assets/services/service-03.webp";
import service03SmImg from "../assets/services/service-03-sm.webp";
import service04Img from "../assets/services/service-04.webp";
import service04SmImg from "../assets/services/service-04-sm.webp";
import service05Img from "../assets/services/service-05.webp";
import service05SmImg from "../assets/services/service-05-sm.webp";
import service06Img from "../assets/services/service-06.webp";
import service06SmImg from "../assets/services/service-06-sm.webp";
import service07Img from "../assets/services/service-07.webp";
import service07SmImg from "../assets/services/service-07-sm.webp";
import service08Img from "../assets/services/service-08.webp";
import service08SmImg from "../assets/services/service-08-sm.webp";
import service09Img from "../assets/services/service-09.webp";
import service09SmImg from "../assets/services/service-09-sm.webp";

export interface ServiceOfferItem {
  number: string;
  title: string;
  description: string;
}

export interface ServiceWhyChooseItem {
  number: string;
  title: string;
  description: string;
}

export const STANDARD_WHY_CHOOSE_US: ServiceWhyChooseItem[] = [
  {
    number: "01",
    title: "Expert Team",
    description:
      "Our certified professionals bring years of experience and industry expertise to every project.",
  },
  {
    number: "02",
    title: "Fast Delivery",
    description:
      "We deliver solutions on time without compromising on quality or attention to detail",
  },
  {
    number: "03",
    title: "Quality Assured",
    description:
      "Every solution undergoes rigorous testing and quality assurance processes.",
  },
];

export interface ServiceDetailItem {
  id: string;
  slug: string;
  title: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  tags: string[];
  image: string;
  imageSrcSet?: string;
  whatWeOfferSubtitle: string;
  whatWeOffer: ServiceOfferItem[];
  whyChooseUsSubtitle: string;
  whyChooseUs: ServiceWhyChooseItem[];
}

export const SERVICES_DATA: ServiceDetailItem[] = [
  {
    id: "01",
    slug: "custom-software-development",
    title: "Custom Software Development",
    titlePart1: "Custom Software",
    titlePart2: "Development",
    description:
      "Tailored AI-powered software solutions built from the ground up to meet your unique business requirements and objectives.",
    tags: ["Custom AI Applications", "Enterprise Software", "API Development"],
    image: service01Img,
    imageSrcSet: `${service01SmImg} 600w, ${service01Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive Custom Software Development services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "Custom AI Applications",
        description:
          "Professional implementation of custom ai applications tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "Enterprise Software",
        description:
          "Professional implementation of enterprise software tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "API Development",
        description:
          "Professional implementation of api development tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
  {
    id: "02",
    slug: "web-and-mobile-applications",
    title: "Web & Mobile Applications",
    titlePart1: "Web & Mobile",
    titlePart2: "Applications",
    description:
      "Modern, responsive web applications with integrated AI capabilities for enhanced user experiences and business intelligence.",
    tags: ["Progressive Web Apps", "Real-time Dashboards", "AI-Powered Features"],
    image: service03Img,
    imageSrcSet: `${service03SmImg} 600w, ${service03Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive Web & Mobile Applications services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "Progressive Web Apps",
        description:
          "Professional implementation of progressive web apps tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "Real-time Dashboards",
        description:
          "Professional implementation of real-time dashboards tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "AI-Powered Features",
        description:
          "Professional implementation of ai-powered features tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
  {
    id: "03",
    slug: "websites",
    title: "Websites",
    titlePart1: "Professional",
    titlePart2: "Websites",
    description:
      "Professional, high-performance websites with AI-driven personalization, analytics, and optimization features.",
    tags: ["AI Content Optimization", "Smart Analytics", "Personalized UX"],
    image: service02Img,
    imageSrcSet: `${service02SmImg} 600w, ${service02Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive Websites development services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "AI Content Optimization",
        description:
          "Professional implementation of ai content optimization tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "Smart Analytics",
        description:
          "Professional implementation of smart analytics tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "Personalized UX",
        description:
          "Professional implementation of personalized ux tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
  {
    id: "04",
    slug: "networking",
    title: "Networking",
    titlePart1: "Enterprise",
    titlePart2: "Networking",
    description:
      "Comprehensive network infrastructure solutions designed to optimize connectivity, security, and performance for modern businesses.",
    tags: ["Network Architecture", "Infrastructure Design", "Performance Optimization"],
    image: service04Img,
    imageSrcSet: `${service04SmImg} 600w, ${service04Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive Enterprise Networking services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "Network Architecture",
        description:
          "Professional implementation of network architecture tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "Infrastructure Design",
        description:
          "Professional implementation of infrastructure design tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "Performance Optimization",
        description:
          "Professional implementation of performance optimization tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
  {
    id: "05",
    slug: "security",
    title: "Security",
    titlePart1: "Cybersecurity &",
    titlePart2: "Defense",
    description:
      "Advanced cybersecurity solutions to protect your digital assets, data, and infrastructure from evolving threats.",
    tags: ["Threat Detection", "Security Audits", "Compliance Management"],
    image: service05Img,
    imageSrcSet: `${service05SmImg} 600w, ${service05Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive Cybersecurity services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "Threat Detection",
        description:
          "Professional implementation of threat detection tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "Security Audits",
        description:
          "Professional implementation of security audits tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "Compliance Management",
        description:
          "Professional implementation of compliance management tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
  {
    id: "06",
    slug: "cloud-solutions",
    title: "Cloud Solutions",
    titlePart1: "Enterprise",
    titlePart2: "Cloud Solutions",
    description:
      "Scalable cloud infrastructure and migration services to modernize your business operations and reduce costs.",
    tags: ["Cloud Migration", "Infrastructure as Code", "Auto-scaling Solutions"],
    image: service06Img,
    imageSrcSet: `${service06SmImg} 600w, ${service06Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive Cloud Solutions services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "Cloud Migration",
        description:
          "Professional implementation of cloud migration tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "Infrastructure as Code",
        description:
          "Professional implementation of infrastructure as code tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "Auto-scaling Solutions",
        description:
          "Professional implementation of auto-scaling solutions tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
  {
    id: "07",
    slug: "voip-solutions",
    title: "VoIP Solutions",
    titlePart1: "Modern",
    titlePart2: "VoIP Solutions",
    description:
      "Modern Voice over Internet Protocol systems for seamless communication and collaboration across your organization.",
    tags: ["VoIP Implementation", "Call Center Solutions", "Unified Communications"],
    image: service07Img,
    imageSrcSet: `${service07SmImg} 600w, ${service07Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive VoIP Solutions services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "VoIP Implementation",
        description:
          "Professional implementation of voip implementation tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "Call Center Solutions",
        description:
          "Professional implementation of call center solutions tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "Unified Communications",
        description:
          "Professional implementation of unified communications tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
  {
    id: "08",
    slug: "backup-and-recovery",
    title: "Backup & Recovery",
    titlePart1: "Backup &",
    titlePart2: "Recovery",
    description:
      "Reliable data backup and disaster recovery solutions to ensure business continuity and data protection.",
    tags: ["Automated Backups", "Disaster Recovery", "Data Retention Policies"],
    image: service08Img,
    imageSrcSet: `${service08SmImg} 600w, ${service08Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive Backup & Recovery services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "Automated Backups",
        description:
          "Professional implementation of automated backups tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "Disaster Recovery",
        description:
          "Professional implementation of disaster recovery tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "Data Retention Policies",
        description:
          "Professional implementation of data retention policies tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
  {
    id: "09",
    slug: "it-support",
    title: "IT Support",
    titlePart1: "Comprehensive",
    titlePart2: "IT Support",
    description:
      "Comprehensive IT support and maintenance services to keep your systems running smoothly and efficiently.",
    tags: ["24/7 Support", "System Maintenance", "Technical Consulting"],
    image: service09Img,
    imageSrcSet: `${service09SmImg} 600w, ${service09Img} 1200w`,
    whatWeOfferSubtitle:
      "Comprehensive IT Support services tailored to modern enterprise requirements.",
    whatWeOffer: [
      {
        number: "01",
        title: "24/7 Support",
        description:
          "Professional implementation of 24/7 support tailored to your specific business needs and requirements.",
      },
      {
        number: "02",
        title: "System Maintenance",
        description:
          "Professional implementation of system maintenance tailored to your specific business needs and requirements.",
      },
      {
        number: "03",
        title: "Technical Consulting",
        description:
          "Professional implementation of technical consulting tailored to your specific business needs and requirements.",
      },
    ],
    whyChooseUsSubtitle: "We choose technology based on the problem, not the trend.",
    whyChooseUs: STANDARD_WHY_CHOOSE_US,
  },
];

export function getServiceByIdOrSlug(identifier?: string): ServiceDetailItem {
  if (!identifier) {
    return SERVICES_DATA[0];
  }
  const clean = identifier.toLowerCase().trim();
  const found = SERVICES_DATA.find(
    (s) =>
      s.id === clean ||
      s.id === clean.padStart(2, "0") ||
      s.slug === clean ||
      s.slug.replace(/-/g, "") === clean.replace(/-/g, "")
  );
  return found || SERVICES_DATA[0];
}

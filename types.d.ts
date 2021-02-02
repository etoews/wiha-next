import { Document } from '@contentful/rich-text-types';

export interface PostInterface {
  heroImage: {
    fields: {
      file: {
        url: string;
      };
    };
  };
  title: string;
  description: string;
  publishDate: string;
  slug: string;
  body: Document;
}

export interface ContentfulImageInterface {
  fields: {
    file: {
      url: string;
    };
    title: string;
  };
}

export interface GenericContentfulPageInterface {
  fields: {
    title: string;
    description: string;
    subtitle1: Document;
    contentBlock1: Document;
    subtitle2: string;
    contentBlock2: Document;
    images: [
      {
        fields: {
          title: string;
          file: {
            url: string;
          };
        };
      }
    ];
  };
}

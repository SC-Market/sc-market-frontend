import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { serviceApi } from "./service"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

const temp_sample: any = {
  pageid: 35591,
  ns: 6,
  title: "File:Demeco - on grey background - Left.jpg",
  imagerepository: "local",
  imageinfo: [
    {
      thumburl:
        "https://media.starcitizen.tools/thumb/0/02/Demeco_-_on_grey_background_-_Left.jpg/200px-Demeco_-_on_grey_background_-_Left.jpg",
      thumbwidth: 200,
      thumbheight: 113,
      responsiveUrls: {
        "2": "https://media.starcitizen.tools/thumb/0/02/Demeco_-_on_grey_background_-_Left.jpg/400px-Demeco_-_on_grey_background_-_Left.jpg",
        "1.5":
          "https://media.starcitizen.tools/thumb/0/02/Demeco_-_on_grey_background_-_Left.jpg/300px-Demeco_-_on_grey_background_-_Left.jpg",
      },
      url: "https://media.starcitizen.tools/0/02/Demeco_-_on_grey_background_-_Left.jpg",
      descriptionurl:
        "https://starcitizen.tools/File:Demeco_-_on_grey_background_-_Left.jpg",
    },
  ],
}
export const images_sample: { [key: string]: typeof temp_sample } = {
  "35591": {
    pageid: 35591,
    ns: 6,
    title: "File:Demeco - on grey background - Left.jpg",
    imagerepository: "local",
    imageinfo: [
      {
        thumburl:
          "https://media.starcitizen.tools/thumb/0/02/Demeco_-_on_grey_background_-_Left.jpg/200px-Demeco_-_on_grey_background_-_Left.jpg",
        thumbwidth: 200,
        thumbheight: 113,
        responsiveUrls: {
          "2": "https://media.starcitizen.tools/thumb/0/02/Demeco_-_on_grey_background_-_Left.jpg/400px-Demeco_-_on_grey_background_-_Left.jpg",
          "1.5":
            "https://media.starcitizen.tools/thumb/0/02/Demeco_-_on_grey_background_-_Left.jpg/300px-Demeco_-_on_grey_background_-_Left.jpg",
        },
        url: "https://media.starcitizen.tools/0/02/Demeco_-_on_grey_background_-_Left.jpg",
        descriptionurl:
          "https://starcitizen.tools/File:Demeco_-_on_grey_background_-_Left.jpg",
      },
    ],
  },
}

export const image_search_sample = [
  {
    id: 17278,
    key: "Demeco_LMG",
    title: "Demeco LMG",
    excerpt: "Demeco LMG",
    matched_title: null,
    description: "LMG manufactured by Klaus & Werner",
    thumbnail: {
      mimetype: "image/jpeg",
      size: 3673,
      width: 200,
      height: 113,
      duration: null,
      url: "https://media.starcitizen.tools/thumb/0/02/Demeco_-_on_grey_background_-_Left.jpg/200px-Demeco_-_on_grey_background_-_Left.jpg",
    },
    images: {
      batchcomplete: "",
      query: {
        normalized: [
          {
            from: "File:Demeco_-_on_grey_background_-_Left.jpg",
            to: "File:Demeco - on grey background - Left.jpg",
          },
        ],
        pages: {
          "35591": images_sample,
        },
      },
    },
  },
  {
    id: 42476,
    key: "Demeco_LMG_Battery_(100_cap)",
    title: "Demeco LMG Battery (100 cap)",
    excerpt: "Demeco LMG Battery (100 cap)",
    matched_title: null,
    description: "Battery manufactured by Klaus & Werner",
    thumbnail: {
      mimetype: "image/jpeg",
      size: 4828,
      width: 200,
      height: 113,
      duration: null,
      url: "https://media.starcitizen.tools/thumb/9/98/Demeco_LMG_Battery_-_Mesh_BG.jpg/200px-Demeco_LMG_Battery_-_Mesh_BG.jpg",
    },
    images: {
      batchcomplete: "",
      query: {
        normalized: [
          {
            from: "File:Demeco_LMG_Battery_-_Mesh_BG.jpg",
            to: "File:Demeco LMG Battery - Mesh BG.jpg",
          },
        ],
        pages: {
          "47773": {
            pageid: 47773,
            ns: 6,
            title: "File:Demeco LMG Battery - Mesh BG.jpg",
            imagerepository: "local",
            imageinfo: [
              {
                thumburl:
                  "https://media.starcitizen.tools/thumb/9/98/Demeco_LMG_Battery_-_Mesh_BG.jpg/200px-Demeco_LMG_Battery_-_Mesh_BG.jpg",
                thumbwidth: 200,
                thumbheight: 113,
                responsiveUrls: {
                  "2": "https://media.starcitizen.tools/thumb/9/98/Demeco_LMG_Battery_-_Mesh_BG.jpg/400px-Demeco_LMG_Battery_-_Mesh_BG.jpg",
                  "1.5":
                    "https://media.starcitizen.tools/thumb/9/98/Demeco_LMG_Battery_-_Mesh_BG.jpg/300px-Demeco_LMG_Battery_-_Mesh_BG.jpg",
                },
                url: "https://media.starcitizen.tools/9/98/Demeco_LMG_Battery_-_Mesh_BG.jpg",
                descriptionurl:
                  "https://starcitizen.tools/File:Demeco_LMG_Battery_-_Mesh_BG.jpg",
              },
            ],
          },
        },
      },
    },
  },
]

export const image_details_example = {
  batchcomplete: "",
  query: {
    normalized: [
      {
        from: "File:Apar_ML_Shot_002_11Dec19-Min.jpg",
        to: "File:Apar ML Shot 002 11Dec19-Min.jpg",
      },
    ],
    pages: {
      "37073": {
        pageid: 37073,
        ns: 6,
        title: "File:Apar ML Shot 002 11Dec19-Min.jpg",
        imagerepository: "local",
        imageinfo: [
          {
            thumburl:
              "https://media.starcitizen.tools/thumb/7/7e/Apar_ML_Shot_002_11Dec19-Min.jpg/200px-Apar_ML_Shot_002_11Dec19-Min.jpg",
            thumbwidth: 200,
            thumbheight: 103,
            responsiveUrls: {
              "1.5":
                "https://media.starcitizen.tools/thumb/7/7e/Apar_ML_Shot_002_11Dec19-Min.jpg/300px-Apar_ML_Shot_002_11Dec19-Min.jpg",
              "2": "https://media.starcitizen.tools/thumb/7/7e/Apar_ML_Shot_002_11Dec19-Min.jpg/400px-Apar_ML_Shot_002_11Dec19-Min.jpg",
            },
            url: "https://media.starcitizen.tools/7/7e/Apar_ML_Shot_002_11Dec19-Min.jpg",
            descriptionurl:
              "https://starcitizen.tools/File:Apar_ML_Shot_002_11Dec19-Min.jpg",
          },
        ],
      },
    },
  },
}

export const page_search_sample = {
  continue: {
    clcontinue: "27228|Personal_weapons",
    continue: "||info|pageimages",
  },
  query: {
    pages: {
      "27228": {
        pageid: 27228,
        ns: 0,
        title: "FS-9H HMG",
        index: 5,
        contentmodel: "wikitext",
        pagelanguage: "en",
        pagelanguagehtmlcode: "en",
        pagelanguagedir: "ltr",
        touched: "2023-03-09T13:17:17Z",
        lastrevid: 203095,
        length: 892,
        thumbnail: {
          source:
            "https://starcitizen.tools/images/thumb/9/93/Placeholderv2.png/50px-Placeholderv2.png",
          width: 50,
          height: 36,
        },
        canonicalurl: "asd",
        pageimage: "Placeholderv2.png",
        categories: [
          {
            ns: 14,
            title: "Category:Behring Applied Technology",
          },
          {
            ns: 14,
            title: "Category:HMGs",
          },
          {
            ns: 14,
            title: "Category:Pages using DynamicPageList3 parser function",
          },
          {
            ns: 14,
            title: "Category:Pages with short description",
          },
        ],
        extract:
          '<p>The <b>FS-9H HMG</b> is a 7\u00a0mm heavy machine gun manufactured by Behring Applied Technology. It has an effective range of 60 meters. As of Alpha 3.12, it is not available in game.\n</p>\n<h2><span id="References">References</span></h2>\n\n\n\n\n<link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r203715">\n<!-- \nNewPP limit report\nCached time: 20230316030154\nCache expiry: 3600\nReduced expiry: true\nComplications: []\nCPU time usage: 0.620 seconds\nReal time usage: 0.756 seconds\nPreprocessor visited node count: 14634/1000000\nPost\u2010expand include size: 122629/2097152 bytes\nTemplate argument size: 23270/2097152 bytes\nHighest expansion depth: 24/100\nExpensive parser function count: 0/100\nUnstrip recursion depth: 0/20\nUnstrip post\u2010expand size: 10273/5000000 bytes\nExtLoops count: 0/100\nLua time usage: 0.115/7.000 seconds\nLua memory usage: 1911341/52428800 bytes\n-->\n<!--\nTransclusion expansion time report (%,ms,calls,template)\n100.00%  719.905      1 -total\n 80.78%  581.574     46 Template:Navplate_DPLCat_row\n 77.95%  561.138     68 Template:DPLCat2\n 43.97%  316.562      1 Template:Navplate_manufacturers\n 40.95%  294.781      1 Template:Navplate_personal_weapons\n 33.31%  239.825    205 Template:DPLAndEscape\n 31.22%  224.750    205 Template:Replace\n 30.71%  221.067     22 Template:Navplate_row\n 12.93%   93.112      1 Template:Infobox_personal_equipment\n 11.08%   79.748      1 Template:Infobox\n-->',
      },
    },
  },
}

export type WikiPage =
  (typeof page_search_sample.query.pages)[keyof typeof page_search_sample.query.pages]

export function transformSearchResults(results: typeof image_search_sample) {
  return results
    .filter((page) => page.thumbnail?.url)
    .map((page) => {
      try {
        const value = (
          page.images.query.pages as unknown as typeof images_sample
        )[
          Object.keys(page.images.query.pages)[0] as string
        ] as typeof temp_sample
        if (Object.keys(value.imageinfo[0].responsiveUrls).length) {
          const maxKey = Object.keys(value.imageinfo[0].responsiveUrls).reduce(
            (k1, k2) => (+k1 > +k2 ? k1 : k2),
          )
          return value.imageinfo[0].responsiveUrls[maxKey]
        } else {
          return page.thumbnail.url
        }
      } catch (e) {
        return page.thumbnail.url
      }
    })
}

export const wikiRestApi = serviceApi.injectEndpoints({
  // reducerPath: 'wikiRestApi',
  // refetchOnReconnect: true,
  // baseQuery: fetchBaseQuery({
  //     baseUrl: `https://scw.czen.me/rest.php/v1/`,
  //     // credentials: 'include'
  // }),
  overrideExisting: false,
  endpoints: (builder) => ({
    // search/title?q=Animus%20Missile%20Launcher&limit=10
    // searchImages: builder.query<typeof image_search_sample, string>({
    //     query: (query) => ({
    //         url: `/search/title`,
    //         params: {
    //             q: query,
    //             limit: 10
    //         }
    //     }),
    //
    // }),
    searchImages: builder.query<typeof image_search_sample, string>({
      query: (query) => ({
        url: `/api/wiki/imagesearch/${encodeURIComponent(query)}`,
        // params: {
        //     q: query,
        //     limit: 10
        // }
      }),
    }),
  }),
})
export const wikiActionApi = serviceApi.injectEndpoints({
  // reducerPath: 'wikiActionApi',
  // refetchOnReconnect: true,
  // baseQuery: fetchBaseQuery({
  //     baseUrl: `https://starcitizen.tools/api.php`,
  //     // credentials: 'include'
  // }),
  overrideExisting: false,
  endpoints: (builder) => ({
    // https://starcitizen.tools/api.php?action=query&prop=imageinfo|pageimages&iiprop=url&iiurlwidth=200&gsrsearch=FS-9&generator=search
    // action=query&prop=info|pageimages|categories&gsrsearch=FS-9&generator=search
    // searchPages: builder.query<typeof page_search_sample, string>({
    //     query: (query) => ({
    //         url: ``,
    //         params: {
    //             action: 'query',
    //             prop: 'info|pageimages|categories|extracts',
    //             gsrsearch: query,
    //             gsrlimit: 50,
    //             generator: 'search',
    //             format: 'json',
    //             // gcmtitle: 'Category:Personal_Weapons
    //             // gcmlimit: 'max',
    //             gexchars: 500,
    //             inprop: 'url',
    //             cllimit: 'max',
    //             explaintext: 'true',
    //         }
    //     })
    // })
    searchPages: builder.query<typeof page_search_sample, string>({
      query: (query) => ({
        url: `/api/wiki/itemsearch/${encodeURIComponent(query)}`,
        // params: {
        //     action: 'query',
        //     prop: 'info|pageimages|categories|extracts',
        //     gsrsearch: query,
        //     gsrlimit: 50,
        //     generator: 'search',
        //     format: 'json',
        //     // gcmtitle: 'Category:Personal_Weapons
        //     // gcmlimit: 'max',
        //     gexchars: 500,
        //     inprop: 'url',
        //     cllimit: 'max',
        //     explaintext: 'true',
        // }
      }),
    }),
  }),
})

export const { useSearchImagesQuery } = wikiRestApi
export const { useSearchPagesQuery } = wikiActionApi

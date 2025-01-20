import slug from "slug";

export class SlugHelper {

  static slugifyString(string: string, type: "urlPath" | "urlSlug", removeCharacters?: string[]) {
    const charactersToRemove = removeCharacters ? removeCharacters : ["for", "and", "nor", "but", "or", "yet", "so", "the", "a", "an"];
    const characStr = charactersToRemove.join("|");
    if (type === "urlPath") {
      slug.extend({ '/': '/' }); //To keep '/' in the url since it's a special character.
    }
    const initialSlug = slug(string, { remove: new RegExp('\\b(' + characStr + ')\\b', 'gi') });
    const verfiedSlug = this.numerifySlug(initialSlug);
    return verfiedSlug;
  }

  //remove multiple numbers in sequence
  static numerifySlug(slug: string) {
    let initialString = slug;
    const regex = /\d+(?:-\d+)+|\d+/g;
    const matchedArray = initialString.match(regex);

    if (matchedArray) {
      matchedArray.forEach((data) => {
        const length = data.length;
        let splitResult = data;
        if (length > 1) {
          const array = data.split("");
          splitResult = array[0];
        }
        const replacedString = initialString.replace(data, splitResult);
        initialString = replacedString;
      });
    }

    return initialString;
  }

}
export class PersonHelper {
  public static getPhotoUrl(churchId: string, person: any) {
    if (!person.photoUpdated) return "";
    else return "/" + churchId + "/membership/people/" + person.id + ".png?dt=" + person.photoUpdated.getTime().toString();
  }

  public static getDisplayName(person: any) {
    if (person?.name?.nick !== null && person?.name?.nick !== "" && person?.name?.nick !== undefined) return person.name.first + " \"" + person.name.nick + "\" " + person.name.last;
    else return person.name.first + " " + person.name.last;
  }

  public static getAge(birthdate: Date): number {
    if (birthdate) {
      const ageDifMs = Date.now() - new Date(birthdate).getTime();
      const ageDate = new Date(ageDifMs);
      const years = Math.abs(ageDate.getUTCFullYear() - 1970);
      return years;
    } else return -1;
  }

  public static getBirthMonth(birthdate: Date): number {
    if (birthdate) return new Date(birthdate).getMonth() + 1;
    else return -1;
  }

}
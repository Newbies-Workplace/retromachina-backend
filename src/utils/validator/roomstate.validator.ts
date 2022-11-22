export type RoomState = "reflection" | "group" | "vote" | "discuss" | "summary";

export class RoomStateValidator {
    static validate(value: any) {
        const possibleValues = ["reflection", "group", "vote", "discuss", "summary"];

        return possibleValues.includes(value);
    }
}
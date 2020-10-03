import { getOptionsFromRawArguments } from "@/lib/options";

const options = getOptionsFromRawArguments(process.argv)

console.log({ options })

import { type RemoteService } from "bonjour"
import ADBJob from "../classes/ADBJob"

export type MakeDeviceProps = {
    name: string,
    test: (service: RemoteService) => boolean,
    job: ADBJob
}

export default function makeDevice(props: MakeDeviceProps): MakeDeviceProps {
    return props;
}
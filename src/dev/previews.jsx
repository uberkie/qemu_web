import React from 'react'
import {ComponentPreview, Previews} from '@react-buddy/ide-toolbox'
import {PaletteTree} from './palette'
import XMLEditor from "../components/XMLEditor";
import VirtualMachineManager from "../components/VirtualMachineManager";
import BackupScheduler from "../components/BackupScheduler";
import Settings from "../components/Settings";
import SnapshotManager from "../components/SnapshotManager";
import Login from "../components/Login";
import App from "../App";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/XMLEditor">
                <XMLEditor/>
            </ComponentPreview>
            <ComponentPreview
                path="/VirtualMachineManager">
                <VirtualMachineManager/>
            </ComponentPreview>
            <ComponentPreview path="/BackupScheduler">
                <BackupScheduler/>
            </ComponentPreview>
            <ComponentPreview path="/Settings">
                <Settings/>
            </ComponentPreview>
            <ComponentPreview path="/SnapshotManager">
                <SnapshotManager/>
            </ComponentPreview>
            <ComponentPreview path="/Login">
                <Login/>
            </ComponentPreview>
            <ComponentPreview path="/App">
                <App/>
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews
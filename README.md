## Demo: P4-Based Emulation of LoWPAN and RPL Networks for Aviation Telemetry and Communication

### Requirements

* Ubuntu LTS +20.04 (22.04 - preferable)
* Containernet - https://github.com/ramonfontes/containernet

**Note**: This tutorial was performed in VM with 4 vCPUs and 8GB vRAM 


## Running the DEMO
 
`$ sudo python topology.py`

* After running the script, one xterm windows will open for the Flask server.
* Then open ui/index.html

## Video
 
Video below illustrates sensors installed in an aircraft, as visualized using the RPL DoDAG Visualization tool, which is a GUI developed to map the network topology. For simplicity purpose, we emulated 42 LoWPAN sensors on a Ubuntu system running Kernel version 6.5.0-1025. In this sense, preliminary results demonstrate that our emulation platform effectively replicates IEEE 802.15.4 networks, integrating the RPL protocol and BMv2 switches.

<p align="center">
  <img src="https://raw.githubusercontent.com/ramonfontes/demo-cnsm-2025/refs/heads/main/video.gif?raw=true" height="480">
</p>

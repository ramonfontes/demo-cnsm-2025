#!/usr/bin/python

"""
@author: Ramon dos Reis Fontes
@email: ramon.fontes@ufrn.br
"""

import os

from containernet.net import Containernet
from containernet.node import DockerP4Sensor, DockerSensor
from containernet.cli import CLI
from mininet.log import info, setLogLevel
from mn_wifi.sixLoWPAN.link import LoWPAN
from mininet.term import makeTerm


def topology():
    net = Containernet(ipBase='192.168.210.0/24')

    path = os.path.dirname(os.path.abspath(__file__))
    json_file = '/root/json/app.json'
    config = path + '/rules/p4_commands.txt'
    args = {'json': json_file, 'switch_config': config}
    mode = 1
    dimage = 'ramonfontes/bmv2:lowpan'

    info('*** Adding Nodes...\n')
    s1 = net.addSwitch("s1", failMode='standalone')
    ap1 = net.addAPSensor('ap1', cls=DockerP4Sensor, ip6='fe80::1/64', panid='0xbeef',
                           dodag_root=True, storing_mode=mode, privileged=True,
                           volumes=[path + "/:/root", "/tmp/.X11-unix:/tmp/.X11-unix:rw"],
                           dimage=dimage, cpu_shares=20, netcfg=True, trickle_t=10,
                           environment={"DISPLAY": ":1"}, loglevel="info",
                           thriftport=50001,  IPBASE="172.17.0.0/24", **args) # IPBASE: docker subnet

    sensors = {}
    for i in range(1, 43):  # Loop de 1 até 42 (inclusive)
        sensor_name = f'sensor{i}'  # Nome do sensor como sensor1, sensor2, ..., sensor42
        ip6 = f'fe80::{i + 1}/64'  # Endereço IPv6 dinâmico (fe80::2, fe80::3, ..., fe80::43)

        sensor = net.addSensor(
            sensor_name,
            ip6=ip6,
            panid='0xbeef',
            trickle_t=10,
            cls=DockerSensor,
            dimage=dimage,
            cpu_shares=20,
            volumes=["/tmp/.X11-unix:/tmp/.X11-unix:rw"],
            environment={"DISPLAY": ":0"},
            privileged=True
        )
        sensors[sensor_name] = sensor

    h1 = net.addDocker('h1', volumes=[path + "/:/root", "/tmp/.X11-unix:/tmp/.X11-unix:rw"],
                       dimage="ramonfontes/grafana", port="3000:3000", ip='192.168.210.1',
                       privileged=True, environment={"DISPLAY": ":1"})

    net.configureWifiNodes()

    info('*** Creating links...\n')
    net.addLink(s1, h1)
    net.addLink(ap1, sensors['sensor1'], cls=LoWPAN)
    net.addLink(ap1, sensors['sensor2'], cls=LoWPAN)
    net.addLink(sensors['sensor1'], sensors['sensor3'], cls=LoWPAN)
    net.addLink(sensors['sensor3'], sensors['sensor4'], cls=LoWPAN)
    net.addLink(sensors['sensor4'], sensors['sensor5'], cls=LoWPAN)
    net.addLink(sensors['sensor5'], sensors['sensor6'], cls=LoWPAN)
    net.addLink(sensors['sensor6'], sensors['sensor7'], cls=LoWPAN)
    net.addLink(sensors['sensor7'], sensors['sensor8'], cls=LoWPAN)
    net.addLink(sensors['sensor8'], sensors['sensor9'], cls=LoWPAN)
    net.addLink(sensors['sensor9'], sensors['sensor10'], cls=LoWPAN)
    net.addLink(sensors['sensor10'], sensors['sensor11'], cls=LoWPAN)
    net.addLink(sensors['sensor11'], sensors['sensor12'], cls=LoWPAN)
    net.addLink(sensors['sensor12'], sensors['sensor13'], cls=LoWPAN)
    net.addLink(sensors['sensor13'], sensors['sensor14'], cls=LoWPAN)
    net.addLink(sensors['sensor14'], sensors['sensor15'], cls=LoWPAN)
    net.addLink(sensors['sensor15'], sensors['sensor16'], cls=LoWPAN)
    net.addLink(sensors['sensor16'], sensors['sensor17'], cls=LoWPAN)
    net.addLink(sensors['sensor17'], sensors['sensor18'], cls=LoWPAN)
    net.addLink(sensors['sensor18'], sensors['sensor19'], cls=LoWPAN)
    net.addLink(sensors['sensor19'], sensors['sensor20'], cls=LoWPAN)
    net.addLink(sensors['sensor20'], sensors['sensor21'], cls=LoWPAN)
    net.addLink(sensors['sensor21'], sensors['sensor22'], cls=LoWPAN)
    net.addLink(sensors['sensor22'], sensors['sensor23'], cls=LoWPAN)
    net.addLink(sensors['sensor23'], sensors['sensor24'], cls=LoWPAN)
    net.addLink(sensors['sensor24'], sensors['sensor25'], cls=LoWPAN)
    net.addLink(sensors['sensor25'], sensors['sensor26'], cls=LoWPAN)
    net.addLink(sensors['sensor26'], sensors['sensor27'], cls=LoWPAN)
    net.addLink(sensors['sensor27'], sensors['sensor28'], cls=LoWPAN)
    net.addLink(sensors['sensor28'], sensors['sensor29'], cls=LoWPAN)
    net.addLink(sensors['sensor28'], sensors['sensor32'], cls=LoWPAN)
    net.addLink(sensors['sensor27'], sensors['sensor33'], cls=LoWPAN)
    net.addLink(sensors['sensor33'], sensors['sensor34'], cls=LoWPAN)
    net.addLink(sensors['sensor32'], sensors['sensor34'], cls=LoWPAN)
    net.addLink(sensors['sensor32'], sensors['sensor35'], cls=LoWPAN)
    net.addLink(sensors['sensor35'], sensors['sensor36'], cls=LoWPAN)
    net.addLink(sensors['sensor30'], sensors['sensor37'], cls=LoWPAN)
    net.addLink(sensors['sensor31'], sensors['sensor37'], cls=LoWPAN)
    net.addLink(sensors['sensor4'], sensors['sensor37'], cls=LoWPAN)
    net.addLink(sensors['sensor5'], sensors['sensor37'], cls=LoWPAN)
    net.addLink(sensors['sensor6'], sensors['sensor38'], cls=LoWPAN)
    net.addLink(sensors['sensor7'], sensors['sensor38'], cls=LoWPAN)
    net.addLink(sensors['sensor8'], sensors['sensor39'], cls=LoWPAN)
    net.addLink(sensors['sensor12'], sensors['sensor40'], cls=LoWPAN)
    net.addLink(sensors['sensor13'], sensors['sensor40'], cls=LoWPAN)
    net.addLink(sensors['sensor14'], sensors['sensor41'], cls=LoWPAN)
    net.addLink(sensors['sensor15'], sensors['sensor42'], cls=LoWPAN)
    net.addLink(sensors['sensor19'], sensors['sensor42'], cls=LoWPAN)
    net.addLink(sensors['sensor23'], sensors['sensor42'], cls=LoWPAN)
    net.addLink(sensors['sensor25'], sensors['sensor41'], cls=LoWPAN)
    net.addLink(sensors['sensor26'], sensors['sensor40'], cls=LoWPAN)
    net.addLink(sensors['sensor27'], sensors['sensor39'], cls=LoWPAN)
    net.addLink(sensors['sensor31'], sensors['sensor2'], cls=LoWPAN)

    net.addLink(ap1, h1)
    h1.cmd('ifconfig h1-eth1 192.168.0.1')

    info('*** Starting network...\n')
    net.build()
    net.addNAT(name='nat0', linkTo='s1', ip='192.168.210.254').configDefault()
    ap1.start([])
    s1.start([])
    net.staticArp()

    h1.cmd('pkill -9 -f xterm')
    makeTerm(h1, title='h1', cmd="bash -c 'httpd && python /root/packet-processing.py;'")
    net.configRPLD(net.sensors + net.apsensors)

    info('*** Running CLI...\n')
    CLI(net)

    info('*** Stopping network...\n')
    net.stop()


if __name__ == '__main__':
    setLogLevel('info')
    topology()

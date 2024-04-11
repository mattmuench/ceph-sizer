// This should go into some file like data.js - populating the table header for chassis configurations

class TableHeaderResults {
    constructor () {
        this.header = [
            // [headertext, headerslotid]
            ["Resulting configuration","gen"],
            ["# servers","num-servers"],
            ["high density","selector-highdense"],
            ["full performance","selector-fullperf"],
            ["NIC config (public network)","nic-num-pub"],
            ["NIC config (cluster network)","nic-num-cluster"],
            ["CPU vcores","num-cpu-cores"],
            ["MEM min","num-mem-gb"],

            ["HDD size","size-hdd-1"],
            ["HDD: # HDDs","num-hdd-1"],
            ["HDD: # SSD type 4","num-ssd-4"],
            ["HDD: # NVMe type 4","num-nvme-4"],

            ["SSD size in TB","size-ssd-1"],
            ["SSD: # SSD","num-ssd-1"],
            ["SSD: # NVMe type 3","num-nvme-3"],
            ["SSD: # NVMe type 5","num-nvme-5"],

            ["NVMe size type 1","size-nvme-1"],
            ["NVMe: # NVMe type 1","num-nvme-1"],
            ["NVMe: # NVMe type 7","num-nvme-7"],
            ["RGW index: # NVMe type 6","num-nvme-6"],
            ["RGW cache: # NVMe type 2","num-nvme-2"],
            
            
            ["raw capacity data devices","capacity-raw-data"],
            ["net capacity (estimated based on use case mix)","capacity-net"],
            ["raw capacity deployed","capacity-raw"],
            ["SKU 10 PB","sku-10-pb"],
            ["SKU 5 PB","sku-5-pb"],
            ["SKU 1 PB","sku-1-pb"],
            ["SKU 512 TB","sku-512-tb"],
            ["SKU 256 TB","sku-256-tb"],
            ["potential max config SSD with current CPU & mem","pot-max-cfg-ssd"],
            ["potential max config HDD with current CPU & mem","pot-max-cgf-hdd"],
            ["potential max config NVMe with current CPU & mem","pot-max-cfg-nvme"],
            ["recommended network with potential full with SSD","rec-net-full-ssd"],
            ["recommended network with potential full with HDD","rec-net-full-hdd"],
            ["recommended network with potential full with NVMe","rec-net-full-nvme"]
        ]
    }
}

export default TableHeaderResults;
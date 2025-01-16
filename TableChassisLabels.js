 // This should go into some file like data.js - populating the table header for chassis configurations

 class TableHeaderChassis {
    constructor () {
        this.header = [
            // [headertext, headerslotid]
            ["Available chassis configuration options","gen","output"],
            ["#slots max HDD of all drive slots","max-hdd-slots","input"],
            ["#slots max SSD of all drive slots","max-ssd-slots","input"],
            ["#slots max NVMe of all drive slots","max-nvme-slots","input"],
            ["# max slots for HDD, SSD and NVMe (in sum, in drive slots)","max-all-slots","input"],
            ["# dedicated slots max NVMe (beside SSD or HDD)","max-dedicated-nvme-slots","input"],
            ["#slots for media (in sum)","max-all-media-sum","input"],

            ["#CPU sockets max","max-cpu-sockets","input"],
            ["#vcores/threads per CPU max (1 HT core = 2 vcores/threads)","max-cpu-cores","input"],
            ["max MEM size","max-mem-gb","input"],

            ["#PCI slots max","max-pci-slots","input"],

            ["NIC speed per port in Gb/sec for public network","speed-nic-public","input"],
            ["NIC speed per port in Gb/sec for cluster network","speed-nic-cluster","input"],
            
            ["HDD size 1 in TB","size-hdd-1","input"],
            ["HDD: Use SSD for fronting HDD instead of NVMe","use-SSD4-over-NVMe4","checkbox"],
            
            ["HDD: SSD type 4 (for dedicated RocksDB+WAL) size in TB (0 => don't use SSD for HDD fronting)","size-ssd4","input"],
            ["HDD: #HDD per SSD type 4 for RocksDB+WAL (#HDD covered by SSD)","hdd-to-ssd4","input"],
            
            ["HDD: NVMe type 4 (for dedicated RocksDB+WAL) size in TB (0 => don't use NVMe for HDD fronting)","size-nvme-4","input"],
            ["HDD: #HDD per NVMe type 4 for RocksDB+WAL (#HDD covered by NVMe)","hdd-to-nvme4","input"],

            ["SSD: SSD size 1 in TB","size-ssd-1","input"],
            ["SSD: SSD fronted by NVMe type 3 for WAL ?","use-optane-1","checkbox"],
            
            ["SSD: NVMe type 5 (for dedicated RocksDB+WAL) size in TB (0 => don't use NVMe for SSD fronting)","size-nvme-5","input"],
            ["SSD: SSD fronted by NVMe type 5 for RocksDB/WAL (#SSD covered by NVMe)","ssd-to-nvme5","input"],
            
            ["SSD: NVMe type 3 (for dedicated WAL) size in TB (0 => don't use NVMe3 for fronting)","size-optane-1","input"],
            ["SSD: #SSD per NVMe type 3 for WAL (#SSD covered by one NVMe)","ssd-to-optane","input"],

            ["NMVe: NVMe type 1 (for data) size in TB","size-nvme-1","input"],
            ["NVMe: NVMe type 1 fronted by NVMe type 7 for WAL ?","use-nvme-7","checkbox"],
            ["NMVe: NVMe7 (as WAL for NVMe1) size in TB","size-nvme-7","input"],
            ["NMVe: #NVMe1 per NVMe type 7 for WAL (#NVMe covered by one NVMe7)","nvme-to-nvme7","input"],
            ["NVMe: NVMe type 1 fronted by NVMe type 8 for RocksDB ?","use-nvme-8","checkbox"],
            ["NMVe: NVMe8 (as RocksDB for NVMe1) size in TB","size-nvme-8","input"],
            ["NMVe: #NVMe1 per NVMe type 8 for RocksDB (#NVMe covered by one NVMe8)","nvme-to-nvme8","input"],
            
            
            ["RGW index: NVMe type 6 (for RGW dedicated index pools) size in TB","size-nvme-6","input"],
            ["RGW cache: Use RGW caching ? (x=yes) - this per config, otherwise the cache device is ignored","use-rgw-caching","checkbox"],
            ["RGW cache: NVMe type 2 (for RGW cache) size in TB","size-nvme-2","input"]
        ]
    }
}


export default TableHeaderChassis;




// This should go into some file like data.js - populating the table header for chassis configurations

class TableHeaderWorkloads {
    constructor () {
        this.header = [
            // [headertext, headerslotid]
            ["Workloads required with characteristics:","gen","output"],
            ["required net available capacity in TB","req-capacity-net","input"],
            ["Flash portion of capacity in %","req-flash-percent","input"],
            ["use case","use-case","radio",["rbd","rgwdata","filedata","filemetadata","iscsi"]],
            ["number of replica","req-num-replica","input"],
            ["# main failure domains","req-number-fd","input"],
            ["do sizing for data media using NVMe instead of SSD for full performance for flash","selector-nvme","checkbox"],
            ["do sizing for high density","selector-highdense","checkbox"],
            ["for RGW: avg object size in KiB, default=100KiB","size-avg-obj","input"],
            ["for file: avg file size in KiB, default=10KiB","size-avg-file","input"],
            ["DC 1","selector-dc0","checkbox"],
            ["DC 2","selector-dc1","checkbox"],
            ["DC 3","selector-dc2","checkbox"],
            ["DC 4","selector-dc3","checkbox"],
            ["DC 5","selector-dc4","checkbox"],
            ["DC 6","selector-dc5","checkbox"],
            ["DC 7","selector-dc6","checkbox"],
            ["DC 8","selector-dc7","checkbox"],
            ["# DCs in use for workload","output-sum-number-dc","output"],
            ["DC check","output-check-num-dc","output"],
            ["Input check","output-check-input-dc","output"],
            ["Provide RGW cache per server ?","selector-rgw-cache","checkbox"],
            ["Check: min # servers per DC for this workload in sum","output-check-min-servers-all","output"],
            ["Check: min # servers in DC 1","output-check-min-servers-dc0","output"],
            ["Check: min # servers in DC 2","output-check-min-servers-dc1","output"],
            ["Check: min # servers in DC 3","output-check-min-servers-dc2","output"],
            ["Check: min # servers in DC 4","output-check-min-servers-dc3","output"],
            ["Check: min # servers in DC 5","output-check-min-servers-dc4","output"],
            ["Check: min # servers in DC 6","output-check-min-servers-dc5","output"],
            ["Check: min # servers in DC 7","output-check-min-servers-dc6","output"],
            ["Check: min # servers in DC 8","output-check-min-servers-dc7","output"],
            ["Life cycle enabled on rgwdata ? #of versions per object (1=default, off)","rgw-lifecycle-num-versions","input"],
            ["Use dedicated flash pool for rgw index ?","selector-rgw-index-flash","checkbox"],
            ["Use dedicated flash media for RocksDB (OSD metadata) (default for HDD, selection for SSD only)?","selector-dedicatedNVMe","checkbox"]
        ]
    }
}


export default TableHeaderWorkloads;

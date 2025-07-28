Hardware configs

The hardware configurations reflect a set of possible configurations of a well defined server hardware.

Actually, all values should be filled in, regardless of the use and sense. This will need to be fixed

Any row in the table reflects a server configuration that one couuld build. Since many options are possible to design a Ceph cluster, any of the hardware configuration options will give a different option. Based on the provided configurations, a Ceph cluster design will be calculated and the variations are displayed. One can then pick one of those directly or play with the values until a reasonable configuration is achieved.

Since no performance, pricing, etc., information is incorporated, actually those configurations lack any hints on viability for economics and price/performance.

Config entries:
In general, those should reflect the actual supported combinations with respect to all other configuration options, like number of CPUs deployed, cages, etc. according to the config matrix dependencies.

<B>Available chassis configuration options</B> Config number of the detailed server configuration. This is used to display the related detailed Resulting configuration. (automatically assigned number)

<B>#slots max HDD of all drive slots</B> Number of slots in the server chassis available to hold HDD in slots available for drives in general. This is assuming that the HDD would occupy slots where also SSD or NVMe could be deployed.

<B>#slots max SSD of all drive slots</B> Number of slots in the server chassis available to hold SSD in slots available for drives in general. This is assuming that the SSD would occupy slots where also HDD or NVMe could be deployed.

<B>#slots max NVMe of all drive slots</B> Number of slots in the server chassis available to hold NVMe in slots available for drives in general. This is assuming that the NVMe would occupy slots where also SSD or HDD could be deployed. This might require a special configuration to allow NVMe in those slots. Those slots might be unusable then for SSD or HDD.

<B># max slots for HDD, SSD and NVMe (in sum, in drive slots)</B> Number of slots available for any kind of drive: HDD, SSD, NVMe in common slots. This gives the upper boundary for any mix of kinds of media in the general purpose slots. This excludes any slots dedicated for accomdating NVMe only. It doesn't include any slots specifically dedicated to NVMe (or just PCI slots one wants to dedicate for NVMe, instead of installing other HBA there)

<B># dedicated slots max NVMe (beside SSD or HDD)</B> Dedicated slots for NVMe only. Chassis might provide a configuration option where specific slots are reserved for NVMe only that cannot be used for SSD nor HDD. It includes any slots specifically dedicated to NVMe (or just PCI slots one wants to dedicate for NVMe, instead of installing other HBA there). Those slots are unavailable for use by HDD and SSD. Those slots include also slots needed for NVMe type 3, e.g. Optanes.

<B>#slots for media (in sum)</B>Sum of all media slots available in the actual configuration of chassis. This includes also dedicated slots for NVMe. This doesn't include the potential OS devices used for booting the node.

<B>#CPU sockets max</B>Number of CPU slots max. available in actual chassis configuration. This number should correspond to what is needed to support the other options, like number of device slots available, number of PCI slots, etc. Also check the memory configuration chosen as maximum memory available.

<B>#vcores/threads per CPU max (1 HT core = 2 vcores/threads) max MEM size</B>Number of threads supported with the CPU kind of choice. The threads might equal to cores, depending on CPU platform of choice and setting of the OS, e.g. HT enabled/disabled for Intel. The number of vcores/threads should reflect exactly what is intended to prersent effectively to the OS. (Corresponds to cpus in output of lscpu command.) This might depend on the generation and model used, perhaps depending also on thermal capacity when other components are installed that restrict the CPU thermal dissipation.

<B>#PCI slots max</B>Number of PCI slots available in actual chassis configuration for placing NIC cards, and others. Currently, unused.

<B>NIC speed per port in Gb/sec for public network</B>Simply the speed in GB/sec for the ports used for public network. Example: 10Gb/sec => 10. (not the max possible speed NICs are available, but may be - should match desired config)

<B>NIC speed per port in Gb/sec for cluster network</B>Simply the speed in GB/sec for the ports used for cluster network. Example: 10Gb/sec => 10. (not the max possible speed NICs are available, but may be - should match desired config)

<B>HDD size 1 in TB</B>The size of the HDD to be used. Note that it's saying TB but not TiB, so stay with what the storage vendor uses. (not the max possible capacity, but may be - should match desired config)

<B>HDD: Use SSD for fronting HDD instead of NVMe</B>For RocksDB/WAL placement, either SSD or NVMe can be used. Usually, one would decide based on price but also based on number of HDD to front. The needed capacity for the desired flash media would usually affect this decision, too.

<B>HDD: SSD type 4 (for dedicated RocksDB+WAL) size in TB (0 => don't use SSD for HDD fronting)</B>This is the size of the SSD to front the HDD if SSD is chosen as the media for RocksDB/WAL. (not the max possible capacity for SSD, but may be - should match desired config)

<B>HDD: #HDD per SSD type 4 for RocksDB+WAL (#HDD covered by SSD)</B>If SSD chosen for fronting HDD for RocksDB/WAL, this is the ratio of how many HDD could be fronted by the given SSD type/model with only regards to IOPS needed. Default setting is 4. (not the max possible capacity for NVMe, but may be - should match desired config)

<B>HDD: NVMe type 4 (for dedicated RocksDB+WAL) size in TB (0 => don't use NVMe for HDD fronting)</B>This is the size of the NVMe to front the HDD if NVMe is chosen as the media for RocksDB/WAL. This NVMe type will be used to front HDD for RocksDB/WAL and for placing object index on it. Actually, the index devices are separate devices, separate from those being used for HDD. The size used in these NVMe used for object index is depending on the life cycle settings and expected number of versions. Although the need of capacity might be smaller than actually provided, a full NVMe per server is calculated minimum additional deployment.

<B>HDD: #HDD per NVMe type 4 for RocksDB+WAL (#HDD covered by NVMe)</B>If NVMe chosen for fronting HDD for RocksDB/WAL, this is the ratio of how many HDD could be fronted by the given NVMe type/model with only regards to IOPS needed. Default setting is 17.

<B>SSD: SSD size 1 in TB</B>This is the size of the SSD used for main workloads. This can be used with RocksDB/WAL on it, using dedicated NVMe to hold RocksDB/WAL, or fronted by NVMe for RocksDB but another NVMe for WAL. Note that WAL is used for everything smaller than 4KiB and thus this SSD can be slower for certain use cases.

<B>SSD: SSD fronted by NVMe type 3 for WAL ?</B>For WAL placement, a dedicated NVMe can be used. Usually, a performant SSD can hold the RocksDB but for many small changes, dedicating a WAL might make sense. This device must match the performance mix of different IO sizes. When workload is dominated by smaller IO sizes below 4KiB, this device might become a bottleneck when shared across many OSDs. Ratio of a full number >0 of SSD that would be fronted by NVMe type 3 for WAL. Needs to be specified if fronting SSD by NVMe for WAL is selected. See discussion for "SSD: NVMe type 3 (for dedicated WAL) size in TB"

<B>SSD: NVMe type 5 (for dedicated RocksDB+WAL) size in TB (0 => don't use NVMe for SSD fronting)</B>The size of the NVMe device fronting SSD. The device is usually shared between some SSD. It's feasible to use a dedicated NVMe to front SSD in cases when latency sensitive workloads exist or the SSD is rather slow but would be sufficient to back the base workloads well enough.

<B>SSD: SSD fronted by NVMe type 5 for RocksDB/WAL (#SSD covered by NVMe)</B>Number of SSD a NVMe of type 5 fronting SSD with RocksDB and WAL could be covered with. Default is 5 SSD per NVMe. note that this is not a fixed number but depends on workloads peaks structure and the demand for RocksDB access and small IOs hitting the WAL. Higher performing NVMe can front more SSD, however, only useful when the SSD is not performant anyways already so that collocating RocksDB/WAL from some SSD would rather create a bottleneck.

<B>SSD: NVMe type 3 (for dedicated WAL) size in TB (0 => don't use NVMe3 for fronting)</B>Size of dedicated NVMe for hosting WAL of SSD fronted by NVMe type 5 carrying the RocksDB. Normal configuration of using NVMe type 5 with RocksDB and WAL on the same media and shared for some SSD would be enhanced if the performance of the NVMe type 5 would be exhausted already by the RocksDB and some relief can be provided separating the WAL. "This device usually doesn't need much capacity because of the size of the WAL. However, depending on the size of IOs seen for writes, the WAL might be heavily used but also will be invalidated each second latest. The WAL that is part of RocksDB in actual implementation is using this WAL. In heavy data changing scenarios, this might be of special interest to allow quick compaction of the level 0. If the IO size of writes/updates is > 4KB, the WAL is not used for the IO but for the RocksDB WAL only.
The performance is essential for fronting already high performing SSD with < 4KB workloads. Given that all changes go through the leveldb WAL and also the data in this scenario, this device might become the bottleneck if too many SSDs must be fronted. Good ratios for high performing SSD up to 100k write IOPS at 4KB and QD16 is 5 SSD per NVMe of type 3."

<B>SSD: #SSD per NVMe type 3 for WAL (#SSD covered by one NVMe)</B>Number of SSD of given type that can be fronted for WAL using this NVMe as dedicated device for WAL. Note that WAL takes only a small capacity and placing too many WAL of different OSDs because of available capacity could create a bottleneck if not observing the WAL workload and NVMe IOPS capacity. <br>This would add some CPU resources to provide enough performance headroom to accomodate the writes.

<B>NMVe: NVMe type 7 (for RocksDB) size in TB</B>The size of NVMe used RocksDB/WAL for fronting NVMe1 for main data.

<B>NVMe: NVMe type 7 (for dedicated RocksDB+WAL) size in TB </B>The size of the NVMe device fronting NVMe1. The device is usually shared between some NVMe1. It's feasible to use a dedicated NVMe to front NVMe1 in cases when latency sensitive workloads exist or the NVMe1 is rather slow but would be sufficient to back the base workloads well enough.

<B>NVMe: NVMe1 fronted by NVMe type 7 for RocksDB/WAL (#NVMe1 covered by NVMe)</B>Number of NVMe1 a NVMe of type 7 fronting NVMe1 with RocksDB and WAL could be covered with. Default is 5 NVMe1 per NVMe type 7. Note that this is not a fixed number but depends on workloads peaks structure and the demand for RocksDB access and small IOs hitting the WAL. Higher performing NVMe of type 7 can front more NVMe1, however, only useful when the NVMe1 is not performant anyways already so that collocating RocksDB/WAL from some NVMe1 would rather create a bottleneck.

<B>NMVe: NVMe8 (as WAL for NVMe1) size in TB</B>The size of NVMe used of dedicated WAL device fronting NVMe for main data.

<B>NMVe: #NVMe1 per NVMe type 8 for RocksDB (#NVMe covered by one NVMe8)</B>Number of NVMe for main data that can be fronted by NVMe type 8 for WAL. Note that WAL takes only a small capacity and placing too many WAL of different OSDs because of available capacity could create a bottleneck if not observing the WAL workload and NVMe IOPS capacity. <br>This would add some CPU resources to provide enough performance headroom to accomodate the writes.

<B>RGW index: NVMe type 6 (for RGW dedicated index pools) size in TB</B>Size of NVMe used to provide extra media for holding the object index. Dedicating media to hold the index of various buckets provides independence for growing number of objects whereas placing the index on the flash media used for RocksDB/WAL for object storage use cases might create a hard block if utilization of capacity is growing towards its maximum. By providing a dedicated pool with dedicated media, only this pool needs to be expanded when the number of objects exhaust the actual capacity. The size used in these NVMe used for object index is depending on the life cycle settings and expected number of versions. Although the need of capacity might be smaller than actually provided, a full NVMe per server is calculated minimum additional deployment.

<B>RGW cache: Use RGW caching ? (x=yes) - this per config, otherwise the cache device is ignored</B>RGW caching devices are dedicated devices provided in node that run the RGW instances. Actually it uses NVMe of type 2.

<B>RGW cache: NVMe type 2 (for RGW cache) size in TB</B>Size of NVMe used for dedicated RGW read-only cache. Although this cache could be an SSD also, currently only NVMe of type 2 used to ease the configuration.

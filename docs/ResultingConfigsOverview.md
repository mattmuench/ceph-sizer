<B>Resulting configuration</B>

The Resulting Configuration gives the oeverview of the resulting configuration as per workloads for any provided hardware chassis configuration. This is to understand the actual config required in sum across all DCs and perhaps changes to it when changing hardware configurations.

Since the overall capacity needed is giving a good estimation for the number of data media required to provide the needed capacity with redundancy applied, the actual number of servers might be influenced by different media used for fronting main data devices, specific role instances deployed in collocation to the OSDs, dedicated devices needed as well as standard flash media required for certain use cases, or for HDDs in general.

The overview helps understanding of changes when changing media, number of CPU, type of CPU, etc., in comparision to other options. This allows to change to a more affordable hardware or to a more performant configuration while understanding what this would mean in terms of nodes required.

Per config, the line shows the sum of the number of the servers used, the media required, NICs needed, etc., the resulting raw deployed capacity of the config, and the SKU calculation. Based in this overview, also a price tag could be computed based in numbers given separately - however, this would be actually a manual process.

Since no performance, pricing, etc., and similar information is incorporated, actually those configurations lack any hints on viability for economics and price/performance.

Depending on the setting of "All servers have the same NIC, cores & mem in config ?", the configuration is shown as the maximum config values per DC in this config. Choosing those would result in a server configuration of NICs, CPU, and memory equal for all DCs. However, the number of media per server will be specific to the DCs config.  
When "All servers have the same NIC, cores & mem in config ?" is not selected, the differing resulting configs for the different involved DCs cannot be shown but there will be a hint to check the appropriate config for specific information. See the tables below workload input. 
 
The column of "raw capacity" hdisplays the overall deployed raw media capacity, excluding the OS devices (not asked for anyway). This is regardless of the setting for same config or not across the DCs.
 
The SKU columns display the SKUs to use for this configuration. Multi-PB SKUs are not used and the expectation is that basic math would be sufficient for now."


<B>Resulting configuration</B>Individual configurations for the resulting cluster based on workloads when using the corresponding hardware configuration. Each row gives the aggregated number of servers, hardware, etc. according to the rules configured for placement of role instances, OSDs, selection of DCs, etc.

<B>#servers high density</B>unused actually

<B>full performance</B>unused actually

<B>NIC config (public network)</B>Number of NICs per server required for public network with actual configuration. This reflects the minimum number of NICs at the given speed of chassis configuration without any scale possible factored into.

<B>NIC config (cluster network)</B>Number of NICs per server required for public network with actual configuration. This reflects the minimum number of NICs at the given speed of chassis configuration without any scale possible factored into.

<B>CPU vcores</B>Number of vcores/threads in sum required for the actual configuration. This reflects the minimum number without any scale possible factored into.

<B>MEM min</B>Memory size in GB in sum required for the actual configuration. This reflects the minimum number without any scale possible factored into.

<B>HDD size</B>Reflection of HDD size copied over from the respective chassis configuration.

<B>HDD: # HDDs</B>Number of HDD needed for the desired capacity and structure of the cluster.

<B>HDD: # SSD type 4</B>Number of SSD needed fronting the HDD for RocksDB/WAL.

<B>HDD: # NVMe type 4</B>Number of NVMe needed fronting the HDD for RocksDB/WAL.

<B>SSD size in TB</B>Reflection of data SSD size copied over from the respective chassis configuration.

<B>SSD: # SSD</B>Number of data SSD needed for the desired capacity and structure of the cluster.

<B>SSD: # NVMe type 3</B>Number of NVMe needed fronting the data SSD for RocksDB/WAL.

<B>SSD: # NVMe type 5</B>Number of NVMe needed for dedicated WAL for the data SSD.

<B>NVMe size type 1</B>Reflection of data NVMe size copied over from the respective chassis configuration.

<B>NVMe: # NVMe type 1</B>Number of data NVMe needed for the desired capacity and structure of the cluster. (unused yet)

<B>NVMe: # NVMe type 7</B>Number of NVMe needed fronting the data NVMe for RocksDB/WAL. (unused yet)

<B>RGW index: # NVMe type 6</B>Number of NVMe dedicated for object index per node.

<B>RGW cache: # NVMe type 2</B>Number of NVMe dedicated for RGW index as cache device per node.

<B>raw capacity data devices net capacity (estimated based on use case mix)</B>The net capacity usable based on the supplied workload configuration and headroom. This is the estimated usable capacity for data.

<B>raw capacity deployed</B>The raw capacity deployed in the cluster using this configuration and media selection. This includes all media used for the Ceph cluster, indepentent of the actual use. This doesn't include OS devices exclusively used for the OS. This is used to determine capacity for subscriptions.

<B>SKU 10 PB</B>unused
<B>SKU 5 PB</B>unused
<B>SKU 1 PB</B>unused
<B>SKU 512 TB</B>unused
<B>SKU 256 TB</B>unused

<B>potential max config SSD with current CPU & mem<B>unused - potentially reflects the configuration if the number of SSDs would be maxed out by keeping the original base configuration.

<B>potential max config HDD with current CPU & mem<B>unused - potentially reflects the configuration if the number of data SSD would be maxed out by keeping the original base configuration.

<B>potential max config NVMe with current CPU & mem<B>unused - potentially reflects the configuration if the number of data NVMe would be maxed out by keeping the original base configuration.

<B>recommended network with potential full with SSD<B>unused - potentially reflects the configuration if the number of data SSDs would be maxed out by adding all needed resources for maxing out the number of available slots.

<B>recommended network with potential full with HDD<B>unused - potentially reflects the configuration if the number of HDD would be maxed out by adding all needed resources for maxing out the number of available slots.

<B>recommended network with potential full with NVMe<B>unused - potentially reflects the configuration if the number of data SNVMeSDs would be maxed out by adding all needed resources for maxing out the number of available slots.

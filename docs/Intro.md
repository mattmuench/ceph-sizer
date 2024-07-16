Introduction to the use of the Ceph sizer input and expected output

1) Converter for TiB to TB 

Enter TiB values for calculation of TB values

Description: 
All values for capacity are (storage) based on 1000. Convert TiB into TB before entering the values.
Entered value is converted into TB and displayed.
If you need to understand the TB to TiB because the customer has given it the other way round, there is a) no need for it since all storage media numbers are given in TB instead of TiB, but b) if you really need it simply enter different numbers into the input field until you find your corresponding one you were looking for :-).



2) Selection for all equal server config
All data centers may have different workloads to serve and thus provide different needs for h/w. This selection gives the option to choose all resulting configs based on the maximum h/w configuration needed in any DC of this config, regardless of what the effective need would be. 
Good when only one kind of servers should be purchased to be able to ship those around in need.

3) Input of different config options of h/w selection
Up to 8 configs can be provided. Those represent different configuration options for servers that one might want to use. 
This might become configurable at some point in time.

All different table column entries might be important or not, depending on h/w vendor and chosen model. These values set the boundaries for an optimal configuration within a DC for the workloads. All workloads would perhaps result in hybrid configurations of servers with optimization of minimizing the overall number of servers based on the given workloads. The goal, however, would be to have equal servers per DC.  
If one wants to separate the servers into all-flash (SSD currently, perhaps fronted by Optanes) and hybrid (HDD fronted by NVMe of type 4), separate configs should be used or one after another. "

4) 
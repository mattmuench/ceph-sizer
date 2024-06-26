# ceph-sizer

A Ceph sizer for capacity and h/w configuration design

The Ceph Sizer is intended to provide a tool to design a Ceph cluster based on required workloads, infrastructure dependencies, config requirements, etc., mapped to a h/w configuration available. From a set of possible configurations given by a supported set of config options of server hardware, variations can be assessed for the same workloads at a time.

The actual implementation is by no means complete, nor nice, but simply an beginners level for JavaScript port of previous spreadsheet based prototype. There are many things to improve or develop.

The basic functionality is intended to work like this:

- any viable h/w configuration can be provided into the "Available chassis cofniguration options" table
- the required workloads are entered into the table "workloads required with characteristics"
- once both tables have desired values entered, the resulting configurations processed and displayed
- as an overview for the configs in table "Resulting configuration"
- and detailed per individual h/w config and DC in the tables named "Resulting configuration config #"

Any modifications can be done either to the workloads or to the h/w configurations and can be applied with the buttons.

The converter is just only a calculator. The values are not incorporated into the workloads. Any radio buttons in the top of the actual page are not functional yet.

Calculations base:
The calculations are based on collocation rules stated by the products by Red Hat and IBM, as well as on recommendations for production clusters. Those might change over time or might need change for better performance or better budget. Any of those values are tunables.

Ratios used are experience based values for now that might not hold true. These are tunables. The ratios for media should base on IOPS differences and workload structure and might not be fixed values. Most of those heavily depend on media performance characteristics. While those ratios are preset to some defaults, this doesn't guarantee any working configuration. In the future, additional explanations will be provided. With changes in the code, also the ratios based on IOPS characteristics might change.

The possible workload configurations might not be supported with the vendors. If you don't run community bits anyway, check with your support provider about the possible infrastructure design.

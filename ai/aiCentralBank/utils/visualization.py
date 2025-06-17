# aiCentralBank/utils/visualization.py

import matplotlib.pyplot as plt

def plot_macro_timeline(timeline, keys=("gdp", "inflation", "unemployment")):
    """
    Plot macroeconomic indicators over time from a simulation timeline.
    """
    if not timeline:
        print("No data to plot.")
        return
    for key in keys:
        vals = [ "unemployment": 0.049},
        {"gdp": 1.015e9, "inflation": 0.022, "unemployment": 0.048}
    ]
    plot_macro_timeline(timeline)

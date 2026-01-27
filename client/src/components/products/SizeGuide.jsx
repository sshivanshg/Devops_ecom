import { useState } from "react";
import { motion } from "framer-motion";
import { Ruler, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { Button } from "../ui/Button";

const sizeCharts = {
  clothing: {
    title: "Clothing",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: [
      { name: "Chest", unit: "in", values: ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46"] },
      { name: "Waist", unit: "in", values: ["28-30", "30-32", "32-34", "34-36", "36-38", "38-40"] },
      { name: "Hip", unit: "in", values: ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46"] },
      { name: "Sleeve", unit: "in", values: ["32", "33", "34", "35", "36", "37"] },
    ],
  },
  pants: {
    title: "Pants & Trousers",
    sizes: ["28", "30", "32", "34", "36", "38"],
    measurements: [
      { name: "Waist", unit: "in", values: ["28", "30", "32", "34", "36", "38"] },
      { name: "Hip", unit: "in", values: ["36", "38", "40", "42", "44", "46"] },
      { name: "Inseam", unit: "in", values: ["30", "30", "32", "32", "32", "32"] },
      { name: "Thigh", unit: "in", values: ["22", "23", "24", "25", "26", "27"] },
    ],
  },
};

const measurementGuide = [
  { name: "Chest", description: "Measure around the fullest part of your chest, keeping the tape horizontal." },
  { name: "Waist", description: "Measure around your natural waistline, keeping the tape comfortably loose." },
  { name: "Hip", description: "Stand with feet together and measure around the fullest part of your hips." },
  { name: "Inseam", description: "Measure from the crotch seam to the bottom of the leg on pants that fit well." },
];

/**
 * Size Chart Table component.
 */
function SizeTable({ chart }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-sm min-w-[400px]">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 pr-4 text-left font-medium text-muted-foreground">
              Size
            </th>
            {chart.sizes.map((size) => (
              <th key={size} className="py-3 px-3 text-center font-medium">
                {size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.measurements.map((measurement, idx) => (
            <tr
              key={measurement.name}
              className={cn(
                "border-b border-border/50",
                idx === chart.measurements.length - 1 && "border-b-0"
              )}
            >
              <td className="py-3 pr-4 text-muted-foreground">
                {measurement.name} ({measurement.unit})
              </td>
              {measurement.values.map((value, i) => (
                <td key={i} className="py-3 px-3 text-center">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Size Guide content for accordion display.
 */
export function SizeGuideContent({ productCategory = "clothing" }) {
  const chart = sizeCharts[productCategory] || sizeCharts.clothing;

  return (
    <div className="space-y-6">
      <SizeTable chart={chart} />
      
      <div className="pt-4 border-t border-border">
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-accent" />
          How to Measure
        </h4>
        <ul className="space-y-2 text-sm">
          {measurementGuide.slice(0, 3).map((item) => (
            <li key={item.name} className="flex gap-2">
              <span className="font-medium text-foreground min-w-[60px]">
                {item.name}:
              </span>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground">
        Model is 6&apos;1&quot; / 185cm and typically wears size M. For a more relaxed fit, 
        we recommend sizing up. Need help?{" "}
        <button className="text-accent hover:underline">Contact our stylists</button>
      </p>
    </div>
  );
}

/**
 * Size Guide Dialog/Modal component.
 */
export function SizeGuideModal({ productCategory = "clothing", trigger }) {
  const [activeChart, setActiveChart] = useState(productCategory);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
            <Ruler className="w-4 h-4" />
            Size Guide
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Size Guide
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Chart Type Tabs */}
          <div className="flex gap-2 mb-6">
            {Object.entries(sizeCharts).map(([key, chart]) => (
              <Button
                key={key}
                variant={activeChart === key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveChart(key)}
              >
                {chart.title}
              </Button>
            ))}
          </div>

          {/* Active Chart */}
          <motion.div
            key={activeChart}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SizeTable chart={sizeCharts[activeChart]} />
          </motion.div>

          {/* How to Measure */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-serif text-lg mb-4">How to Measure</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {measurementGuide.map((item) => (
                <div key={item.name} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent text-sm font-medium">
                      {item.name[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-muted/50 rounded-sm">
            <h4 className="font-medium text-sm mb-2">Pro Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use a flexible measuring tape for accuracy</li>
              <li>• Measure over light clothing or underwear</li>
              <li>• Keep the tape snug but not tight</li>
              <li>• When in doubt, size up for a relaxed fit</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
